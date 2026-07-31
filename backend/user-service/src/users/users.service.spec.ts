// AI-generated: Unit tests for UserService with password hashing and login authentication
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import type { IUserRepository } from './interfaces/user-repository.interface';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockRepo: Partial<jest.Mocked<IUserRepository>> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'USER_REPOSITORY',
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockUserRepository = module.get('USER_REPOSITORY');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should successfully create a user when email is unique', async () => {
      const name = 'Alice';
      const email = 'alice@example.com';
      const password = 'mypassword';
      const mockCreatedUser: User = {
        id: 'user-uuid-123',
        name,
        email,
        passwordHash: 'hashed-password',
        createdAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await service.createUser(name, email, password);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name,
          email,
          passwordHash: expect.any(String),
        }),
      );
      expect(result).toEqual(mockCreatedUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      const name = 'Alice';
      const email = 'alice@example.com';
      const password = 'mypassword';
      const existingUser: User = {
        id: 'user-uuid-123',
        name: 'Bob',
        email,
        passwordHash: 'existing-hash',
        createdAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(service.createUser(name, email, password)).rejects.toThrow(
        ConflictException,
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return user when credentials match', async () => {
      const email = 'alice@example.com';
      const password = 'mypassword';
      const passwordHash = await bcrypt.hash(password, 10);
      const mockUser: User = {
        id: 'user-uuid-123',
        name: 'Alice',
        email,
        passwordHash,
        createdAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.login(email, password);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      const email = 'alice@example.com';
      const password = 'mypassword';
      const incorrectPassword = 'wrongpassword';
      const passwordHash = await bcrypt.hash(password, 10);
      const mockUser: User = {
        id: 'user-uuid-123',
        name: 'Alice',
        email,
        passwordHash,
        createdAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.login(email, incorrectPassword)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUserById', () => {
    it('should return a user if found by ID', async () => {
      const userId = 'user-uuid-123';
      const mockUser: User = {
        id: userId,
        name: 'Alice',
        email: 'alice@example.com',
        passwordHash: 'hash',
        createdAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getUserById(userId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found by ID', async () => {
      const userId = 'non-existent-id';
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.getUserById(userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users from repository', async () => {
      const mockUsers: User[] = [
        { id: '1', name: 'Alice', email: 'alice@example.com', passwordHash: 'hash', createdAt: new Date() },
        { id: '2', name: 'Bob', email: 'bob@example.com', passwordHash: 'hash', createdAt: new Date() },
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();

      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });
});
