// AI-generated: IMessageRepository interface to implement Dependency Inversion Principle (DIP)
import { Message } from '../entities/message.entity';

export interface IMessageRepository {
  createMessage(chatId: string, senderId: string, content: string): Promise<Message>;
  findMessagesByChatId(chatId: string): Promise<Message[]>;
}
