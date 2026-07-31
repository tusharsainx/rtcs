// AI-generated: Unit tests for ChatsService using Jest and mocked repository interfaces
import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import type { IChatRepository } from './interfaces/chat-repository.interface';
import type { IMessageRepository } from './interfaces/message-repository.interface';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { Message } from './entities/message.entity';

describe('ChatsService', () => {
  let service: ChatsService;
  let mockChatRepository: jest.Mocked<IChatRepository>;
  let mockMessageRepository: jest.Mocked<IMessageRepository>;

  beforeEach(async () => {
    const mockChatRepo: Partial<jest.Mocked<IChatRepository>> = {
      createChat: jest.fn(),
      findChatById: jest.fn(),
      addParticipant: jest.fn(),
      findParticipant: jest.fn(),
      findParticipantsByChatId: jest.fn(),
    };

    const mockMessageRepo: Partial<jest.Mocked<IMessageRepository>> = {
      createMessage: jest.fn(),
      findMessagesByChatId: jest.fn(),
    };

    const mockRedisClient = {
      rpush: jest.fn().mockResolvedValue(1),
      ltrim: jest.fn().mockResolvedValue('OK'),
      expire: jest.fn().mockResolvedValue(1),
      lrange: jest.fn().mockResolvedValue([]),
      pipeline: jest.fn().mockReturnValue({
        del: jest.fn().mockReturnThis(),
        rpush: jest.fn().mockReturnThis(),
        ltrim: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        {
          provide: 'CHAT_REPOSITORY',
          useValue: mockChatRepo,
        },
        {
          provide: 'MESSAGE_REPOSITORY',
          useValue: mockMessageRepo,
        },
        {
          provide: 'REDIS_PUBLISHER',
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
    mockChatRepository = module.get('CHAT_REPOSITORY');
    mockMessageRepository = module.get('MESSAGE_REPOSITORY');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createChat', () => {
    it('should successfully create a chat', async () => {
      const chatName = 'Tech Talk';
      const mockChat: Chat = { id: 'chat-uuid-1', name: chatName, createdAt: new Date() };

      mockChatRepository.createChat.mockResolvedValue(mockChat);

      const result = await service.createChat(chatName);

      expect(mockChatRepository.createChat).toHaveBeenCalledWith(chatName);
      expect(result).toEqual(mockChat);
    });
  });

  describe('joinChat', () => {
    const chatId = 'chat-uuid-1';
    const userId = 'user-uuid-1';

    it('should successfully join a chat if chat exists and user is not a participant', async () => {
      const mockChat: Chat = { id: chatId, name: 'Chat Room', createdAt: new Date() };
      const mockParticipant: ChatParticipant = {
        id: 'participant-uuid-1',
        chatId,
        userId,
        joinedAt: new Date(),
      };

      mockChatRepository.findChatById.mockResolvedValue(mockChat);
      mockChatRepository.findParticipant.mockResolvedValue(null);
      mockChatRepository.addParticipant.mockResolvedValue(mockParticipant);

      const result = await service.joinChat(chatId, userId);

      expect(mockChatRepository.findChatById).toHaveBeenCalledWith(chatId);
      expect(mockChatRepository.findParticipant).toHaveBeenCalledWith(chatId, userId);
      expect(mockChatRepository.addParticipant).toHaveBeenCalledWith(chatId, userId);
      expect(result).toEqual(mockParticipant);
    });

    it('should throw NotFoundException if chat does not exist', async () => {
      mockChatRepository.findChatById.mockResolvedValue(null);

      await expect(service.joinChat(chatId, userId)).rejects.toThrow(NotFoundException);

      expect(mockChatRepository.findChatById).toHaveBeenCalledWith(chatId);
      expect(mockChatRepository.addParticipant).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if user is already a participant', async () => {
      const mockChat: Chat = { id: chatId, name: 'Chat Room', createdAt: new Date() };
      const existingParticipant: ChatParticipant = {
        id: 'participant-uuid-1',
        chatId,
        userId,
        joinedAt: new Date(),
      };

      mockChatRepository.findChatById.mockResolvedValue(mockChat);
      mockChatRepository.findParticipant.mockResolvedValue(existingParticipant);

      await expect(service.joinChat(chatId, userId)).rejects.toThrow(ConflictException);

      expect(mockChatRepository.findChatById).toHaveBeenCalledWith(chatId);
      expect(mockChatRepository.findParticipant).toHaveBeenCalledWith(chatId, userId);
      expect(mockChatRepository.addParticipant).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    const chatId = 'chat-uuid-1';
    const senderId = 'user-uuid-1';
    const content = 'Hello world!';

    it('should successfully send a message if sender is a participant', async () => {
      const mockChat: Chat = { id: chatId, name: 'Room', createdAt: new Date() };
      const mockParticipant: ChatParticipant = {
        id: 'participant-uuid-1',
        chatId,
        userId: senderId,
        joinedAt: new Date(),
      };
      const mockMessage: Message = {
        id: 'msg-uuid-1',
        chatId,
        senderId,
        content,
        sequence: 1,
        createdAt: new Date(),
      };

      mockChatRepository.findChatById.mockResolvedValue(mockChat);
      mockChatRepository.findParticipant.mockResolvedValue(mockParticipant);
      mockMessageRepository.createMessage.mockResolvedValue(mockMessage);

      const result = await service.sendMessage(chatId, senderId, content);

      expect(mockChatRepository.findChatById).toHaveBeenCalledWith(chatId);
      expect(mockChatRepository.findParticipant).toHaveBeenCalledWith(chatId, senderId);
      expect(mockMessageRepository.createMessage).toHaveBeenCalledWith(chatId, senderId, content);
      expect(result).toEqual(mockMessage);
    });

    it('should throw NotFoundException if chat does not exist', async () => {
      mockChatRepository.findChatById.mockResolvedValue(null);

      await expect(service.sendMessage(chatId, senderId, content)).rejects.toThrow(NotFoundException);

      expect(mockChatRepository.findChatById).toHaveBeenCalledWith(chatId);
      expect(mockMessageRepository.createMessage).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if sender is not a participant', async () => {
      const mockChat: Chat = { id: chatId, name: 'Room', createdAt: new Date() };

      mockChatRepository.findChatById.mockResolvedValue(mockChat);
      mockChatRepository.findParticipant.mockResolvedValue(null);

      await expect(service.sendMessage(chatId, senderId, content)).rejects.toThrow(ForbiddenException);

      expect(mockChatRepository.findChatById).toHaveBeenCalledWith(chatId);
      expect(mockChatRepository.findParticipant).toHaveBeenCalledWith(chatId, senderId);
      expect(mockMessageRepository.createMessage).not.toHaveBeenCalled();
    });
  });

  describe('getChatMessages', () => {
    const chatId = 'chat-uuid-1';
    const requesterId = 'user-uuid-1';

    it('should retrieve messages successfully if requester is a participant', async () => {
      const mockChat: Chat = { id: chatId, name: 'Room', createdAt: new Date() };
      const mockParticipant: ChatParticipant = {
        id: 'participant-uuid-1',
        chatId,
        userId: requesterId,
        joinedAt: new Date(),
      };
      const mockMessages: Message[] = [
        { id: 'm1', chatId, senderId: requesterId, content: 'Hey', sequence: 1, createdAt: new Date() },
        { id: 'm2', chatId, senderId: 'user-2', content: 'Hi', sequence: 2, createdAt: new Date() },
      ];

      mockChatRepository.findChatById.mockResolvedValue(mockChat);
      mockChatRepository.findParticipant.mockResolvedValue(mockParticipant);
      mockMessageRepository.findMessagesByChatId.mockResolvedValue(mockMessages);

      const result = await service.getChatMessages(chatId, requesterId);

      expect(mockChatRepository.findChatById).toHaveBeenCalledWith(chatId);
      expect(mockChatRepository.findParticipant).toHaveBeenCalledWith(chatId, requesterId);
      expect(mockMessageRepository.findMessagesByChatId).toHaveBeenCalledWith(chatId);
      expect(result).toEqual(mockMessages);
    });

    it('should throw ForbiddenException if requester is not a participant', async () => {
      const mockChat: Chat = { id: chatId, name: 'Room', createdAt: new Date() };

      mockChatRepository.findChatById.mockResolvedValue(mockChat);
      mockChatRepository.findParticipant.mockResolvedValue(null);

      await expect(service.getChatMessages(chatId, requesterId)).rejects.toThrow(ForbiddenException);

      expect(mockChatRepository.findChatById).toHaveBeenCalledWith(chatId);
      expect(mockChatRepository.findParticipant).toHaveBeenCalledWith(chatId, requesterId);
      expect(mockMessageRepository.findMessagesByChatId).not.toHaveBeenCalled();
    });
  });
});
