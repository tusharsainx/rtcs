// AI-generated: TypeORM implementation of IMessageRepository with sequence-based ordering and filtering
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Message } from '../entities/message.entity';
import { IMessageRepository } from '../interfaces/message-repository.interface';

@Injectable()
export class TypeORMMessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repository: Repository<Message>,
  ) {}

  async createMessage(chatId: string, senderId: string, content: string): Promise<Message> {
    const message = this.repository.create({ chatId, senderId, content });
    return this.repository.save(message);
  }

  async findMessagesByChatId(chatId: string): Promise<Message[]> {
    return this.repository.find({
      where: { chatId },
      order: { sequence: 'ASC' },
    });
  }

  async findMessagesBeforeSequence(chatId: string, beforeSequence: number, limit: number): Promise<Message[]> {
    const messages = await this.repository.find({
      where: { chatId, sequence: LessThan(beforeSequence) },
      order: { sequence: 'DESC' },
      take: limit,
    });
    return messages.reverse();
  }

  async findRecentMessages(chatId: string, limit: number): Promise<Message[]> {
    const messages = await this.repository.find({
      where: { chatId },
      order: { sequence: 'DESC' },
      take: limit,
    });
    return messages.reverse();
  }
}
