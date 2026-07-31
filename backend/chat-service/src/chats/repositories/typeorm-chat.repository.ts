// AI-generated: TypeORM implementation of IChatRepository
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { ChatParticipant } from '../entities/chat-participant.entity';
import { IChatRepository } from '../interfaces/chat-repository.interface';

@Injectable()
export class TypeORMChatRepository implements IChatRepository {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatParticipant)
    private readonly participantRepository: Repository<ChatParticipant>,
  ) {}

  async createChat(name?: string): Promise<Chat> {
    const chat = this.chatRepository.create({ name });
    return this.chatRepository.save(chat);
  }

  async findChatById(id: string): Promise<Chat | null> {
    return this.chatRepository.findOneBy({ id });
  }

  async addParticipant(chatId: string, userId: string): Promise<ChatParticipant> {
    const participant = this.participantRepository.create({ chatId, userId });
    return this.participantRepository.save(participant);
  }

  async findParticipant(chatId: string, userId: string): Promise<ChatParticipant | null> {
    return this.participantRepository.findOneBy({ chatId, userId });
  }

  async findParticipantsByChatId(chatId: string): Promise<ChatParticipant[]> {
    return this.participantRepository.findBy({ chatId });
  }

  async findAllChats(): Promise<Chat[]> {
    return this.chatRepository.find();
  }
}
