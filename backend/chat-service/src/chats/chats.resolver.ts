// AI-generated: ChatsResolver routing mutations and queries, and exposing real-time subscriptions
import { Resolver, Mutation, Query, Subscription, Args, ID, Int } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Chat } from './entities/chat.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { Message } from './entities/message.entity';
import { CreateChatInput } from './dto/create-chat.input';
import { JoinChatInput } from './dto/join-chat.input';
import { SendMessageInput } from './dto/send-message.input';
import type { IEventPublisher } from './interfaces/event-publisher.interface';

@Resolver()
export class ChatsResolver {
  constructor(
    private readonly chatsService: ChatsService,
    @Inject('EVENT_PUBLISHER')
    private readonly eventPublisher: IEventPublisher,
  ) {}

  @Mutation(() => Chat)
  async createChat(
    @Args('input') input: CreateChatInput,
  ): Promise<Chat> {
    return this.chatsService.createChat(input.name);
  }

  @Mutation(() => ChatParticipant)
  async joinChat(
    @Args('input') input: JoinChatInput,
  ): Promise<ChatParticipant> {
    return this.chatsService.joinChat(input.chatId, input.userId);
  }

  @Mutation(() => Message)
  async sendMessage(
    @Args('input') input: SendMessageInput,
  ): Promise<Message> {
    // 1. Persist
    const message = await this.chatsService.sendMessage(input.chatId, input.senderId, input.content);
    // 2. Publish
    await this.eventPublisher.publish('messageAdded', { messageAdded: message });
    return message;
  }

  @Query(() => [Message], { name: 'chatMessages' })
  async getChatMessages(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('senderId', { type: () => ID }) senderId: string,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
    @Args('beforeSequence', { type: () => Int, nullable: true }) beforeSequence?: number,
  ): Promise<Message[]> {
    return this.chatsService.getChatMessages(chatId, senderId, limit, beforeSequence);
  }

  @Query(() => [Chat], { name: 'chats' })
  async getChats(): Promise<Chat[]> {
    return this.chatsService.getAllChats();
  }

  @Query(() => String, { name: 'chatServiceInstance' })
  getChatServiceInstance(): string {
    return process.env.INSTANCE_NAME || 'chat-service-instance-1';
  }

  @Subscription(() => Message, {
    filter: (payload, variables) => {
      return payload.messageAdded.chatId === variables.chatId;
    },
  })
  messageAdded(
    @Args('chatId', { type: () => ID }) chatId: string,
  ) {
    return this.eventPublisher.asyncIterator('messageAdded');
  }
}
