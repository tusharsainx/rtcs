// AI-generated: IChatRepository interface to implement Dependency Inversion Principle (DIP)
import { Chat } from '../entities/chat.entity';
import { ChatParticipant } from '../entities/chat-participant.entity';

export interface IChatRepository {
  createChat(name?: string): Promise<Chat>;
  findChatById(id: string): Promise<Chat | null>;
  addParticipant(chatId: string, userId: string): Promise<ChatParticipant>;
  findParticipant(chatId: string, userId: string): Promise<ChatParticipant | null>;
  findParticipantsByChatId(chatId: string): Promise<ChatParticipant[]>;
  findAllChats(): Promise<Chat[]>;
}
