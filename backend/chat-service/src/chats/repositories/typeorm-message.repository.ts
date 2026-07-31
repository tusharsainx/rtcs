// AI-generated: TypeORM implementation of IMessageRepository with sequence-based ordering
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
