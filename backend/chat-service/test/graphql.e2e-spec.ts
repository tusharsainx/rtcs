// AI-generated: E2E GraphQL integration test validating NestJS resolvers, TypeORM database persistence, and message query sequences
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Chat } from '../src/chats/entities/chat.entity';
import { ChatParticipant } from '../src/chats/entities/chat-participant.entity';
import { Message } from '../src/chats/entities/message.entity';

describe('GraphQL API (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
    await app.close();
  });

  beforeEach(async () => {
    // Clear tables before E2E testing
    await dataSource.getRepository(Message).clear();
    await dataSource.getRepository(ChatParticipant).clear();
    await dataSource.getRepository(Chat).clear();
  });

  it('should complete E2E flow: createChat -> joinChat -> sendMessage -> chatMessages', async () => {
    // 1. Create Chat Room
    const createChatMutation = `
      mutation CreateChat($input: CreateChatInput!) {
        createChat(input: $input) {
          id
          name
        }
      }
    `;
    const chatName = 'E2E Test Lounge';
    const createChatRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: createChatMutation,
        variables: { input: { name: chatName } },
      })
      .expect(200);

    const chat = createChatRes.body.data.createChat;
    expect(chat.id).toBeDefined();
    expect(chat.name).toBe(chatName);

    // 2. Join Chat Room
    const joinChatMutation = `
      mutation JoinChat($input: JoinChatInput!) {
        joinChat(input: $input) {
          id
          chatId
          userId
        }
      }
    `;
    const userId = '00000000-0000-0000-0000-000000000001';
    const joinChatRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: joinChatMutation,
        variables: { input: { chatId: chat.id, userId } },
      })
      .expect(200);

    const participant = joinChatRes.body.data.joinChat;
    expect(participant.id).toBeDefined();
    expect(participant.chatId).toBe(chat.id);
    expect(participant.userId).toBe(userId);

    // 3. Send Message (First)
    const sendMessageMutation = `
      mutation SendMessage($input: SendMessageInput!) {
        sendMessage(input: $input) {
          id
          chatId
          senderId
          content
          sequence
        }
      }
    `;
    const sendMessageRes1 = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: sendMessageMutation,
        variables: { input: { chatId: chat.id, senderId: userId, content: 'First message!' } },
      })
      .expect(200);

    const msg1 = sendMessageRes1.body.data.sendMessage;
    expect(msg1.id).toBeDefined();
    expect(msg1.content).toBe('First message!');
    expect(msg1.sequence).toBeGreaterThan(0);

    // 4. Send Message (Second)
    const sendMessageRes2 = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: sendMessageMutation,
        variables: { input: { chatId: chat.id, senderId: userId, content: 'Second message!' } },
      })
      .expect(200);

    const msg2 = sendMessageRes2.body.data.sendMessage;
    expect(msg2.content).toBe('Second message!');
    expect(msg2.sequence).toBe(msg1.sequence + 1);

    // 5. Query Message History & Verify Order
    const chatMessagesQuery = `
      query GetChatMessages($chatId: ID!, $senderId: ID!) {
        chatMessages(chatId: $chatId, senderId: $senderId) {
          id
          content
          sequence
        }
      }
    `;
    const queryMessagesRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: chatMessagesQuery,
        variables: { chatId: chat.id, senderId: userId },
      })
      .expect(200);

    const history = queryMessagesRes.body.data.chatMessages;
    expect(history).toHaveLength(2);
    expect(history[0].content).toBe('First message!');
    expect(history[1].content).toBe('Second message!');
    expect(history[1].sequence).toBe(history[0].sequence + 1);
  });

  it('should reject sendMessage from non-participant user', async () => {
    // 1. Create Chat Room
    const chatRepository = dataSource.getRepository(Chat);
    const chat = await chatRepository.save(chatRepository.create({ name: 'Private Suite' }));

    // 2. Attempt to send message without joining (user: non-participant)
    const sendMessageMutation = `
      mutation SendMessage($input: SendMessageInput!) {
        sendMessage(input: $input) {
          id
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: sendMessageMutation,
        variables: { input: { chatId: chat.id, senderId: '00000000-0000-0000-0000-000000000002', content: 'Sneak in!' } },
      })
      .expect(200);

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toContain('not a participant');
  });
});
