import { Injectable, Inject, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { Message } from './entities/message.entity';
import type { IChatRepository } from './interfaces/chat-repository.interface';
import type { IMessageRepository } from './interfaces/message-repository.interface';
import Redis from 'ioredis';

@Injectable()
export class ChatsService {
  constructor(
    @Inject('CHAT_REPOSITORY')
    private readonly chatRepository: IChatRepository,
    @Inject('MESSAGE_REPOSITORY')
    private readonly messageRepository: IMessageRepository,
    @Inject('REDIS_PUBLISHER')
    private readonly redisClient: Redis,
  ) {}

  async createChat(name?: string): Promise<Chat> {
    return this.chatRepository.createChat(name);
  }

  async getAllChats(): Promise<Chat[]> {
    return this.chatRepository.findAllChats();
  }

  async joinChat(chatId: string, userId: string): Promise<ChatParticipant> {
    const chat = await this.chatRepository.findChatById(chatId);
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    const existingParticipant = await this.chatRepository.findParticipant(chatId, userId);
    if (existingParticipant) {
      throw new ConflictException(`User ${userId} is already a participant in chat ${chatId}`);
    }

    return this.chatRepository.addParticipant(chatId, userId);
  }

  async sendMessage(chatId: string, senderId: string, content: string): Promise<Message> {
    const chat = await this.chatRepository.findChatById(chatId);
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    const isParticipant = await this.chatRepository.findParticipant(chatId, senderId);
    if (!isParticipant) {
      throw new ForbiddenException(`User ${senderId} is not a participant in chat ${chatId}`);
    }

    const message = await this.messageRepository.createMessage(chatId, senderId, content);

    // Cache Write-Through: Append message to Redis and limit list size to prevent RAM bloat
    try {
      const redisKey = `chat:${chatId}:messages`;
      await this.redisClient.rpush(redisKey, JSON.stringify(message));
      await this.redisClient.ltrim(redisKey, -50, -1);
      await this.redisClient.expire(redisKey, 86400); // 24 hours expiration
    } catch (err: any) {
      console.warn(`Redis Cache Write failed (resilient fallback active): ${err.message}`);
    }

    return message;
  }

  async getChatMessages(chatId: string, senderId: string): Promise<Message[]> {
    const chat = await this.chatRepository.findChatById(chatId);
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    const isParticipant = await this.chatRepository.findParticipant(chatId, senderId);
    if (!isParticipant) {
      throw new ForbiddenException(`User ${senderId} is not a participant in chat ${chatId}`);
    }

    // Cache-Aside Look up: Try loading from Redis first
    const redisKey = `chat:${chatId}:messages`;
    try {
      const cached = await this.redisClient.lrange(redisKey, 0, -1);
      if (cached && cached.length > 0) {
        return cached.map((msgStr) => {
          const parsed = JSON.parse(msgStr);
          // Revive Date type from ISO string
          if (parsed.createdAt) {
            parsed.createdAt = new Date(parsed.createdAt);
          }
          return parsed;
        });
      }
    } catch (err: any) {
      console.warn(`Redis Cache Read failed (resilient fallback active): ${err.message}`);
    }

    // Cache Miss: Query PostgreSQL database
    const messages = await this.messageRepository.findMessagesByChatId(chatId);

    // Backfill Cache: Save retrieved messages to Redis
    if (messages.length > 0) {
      try {
        const pipeline = this.redisClient.pipeline();
        pipeline.del(redisKey);
        messages.forEach((msg) => pipeline.rpush(redisKey, JSON.stringify(msg)));
        pipeline.ltrim(redisKey, -50, -1);
        pipeline.expire(redisKey, 86400); // 24 hours expiration
        await pipeline.exec();
      } catch (err: any) {
        console.warn(`Redis Cache Backfill failed (resilient fallback active): ${err.message}`);
      }
    }

    return messages;
  }
}
