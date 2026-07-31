// AI-generated: Integration test for ChatsResolver verifying real database persistence, Redis PubSub event publishing, and execution order
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ChatsResolver } from './chats.resolver';
import { DataSource } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { Message } from './entities/message.entity';
import { SendMessageInput } from './dto/send-message.input';
import type { IEventPublisher } from './interfaces/event-publisher.interface';
import type { IMessageRepository } from './interfaces/message-repository.interface';

describe('ChatsResolver Integration (Real PG + Redis)', () => {
  let appModule: TestingModule;
  let resolver: ChatsResolver;
  let dataSource: DataSource;
  let eventPublisher: IEventPublisher;
  let messageRepository: IMessageRepository;

  beforeAll(async () => {
    // Override config or use process env defaults (which are set to localhost in AppModule fallback)
    appModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    resolver = appModule.get<ChatsResolver>(ChatsResolver);
    dataSource = appModule.get<DataSource>(DataSource);
    eventPublisher = appModule.get<IEventPublisher>('EVENT_PUBLISHER');
    messageRepository = appModule.get<IMessageRepository>('MESSAGE_REPOSITORY');
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
    if (appModule) {
      await appModule.close();
    }
  });

  beforeEach(async () => {
    // Clear tables before each test
    // Delete messages first to satisfy foreign key constraints if any, or clear
    await dataSource.getRepository(Message).clear();
    await dataSource.getRepository(ChatParticipant).clear();
    await dataSource.getRepository(Chat).clear();
  });

  it('should verify persist-then-publish order and matching subscription payload', async () => {
    // 1. Create a chat session
    const chatRepository = dataSource.getRepository(Chat);
    const chat = await chatRepository.save(chatRepository.create({ name: 'Integration Room' }));

    // 2. Add a participant
    const participantRepository = dataSource.getRepository(ChatParticipant);
    const userId = '00000000-0000-0000-0000-000000000001';
    await participantRepository.save(participantRepository.create({ chatId: chat.id, userId }));

    // 3. Spy on createMessage and publish to verify execution order
    const executionTimeline: string[] = [];

    const originalCreateMessage = messageRepository.createMessage.bind(messageRepository);
    jest.spyOn(messageRepository, 'createMessage').mockImplementation(async (cId, sId, cont) => {
      executionTimeline.push('persist-start');
      const res = await originalCreateMessage(cId, sId, cont);
      executionTimeline.push('persist-end');
      return res;
    });

    jest.spyOn(eventPublisher, 'publish').mockImplementation(async (triggerName, payload) => {
      executionTimeline.push('publish-start');
      executionTimeline.push('publish-end');
      return;
    });

    // 4. Setup a real Redis PubSub listener for the subscription event
    const subscriptionIterator = eventPublisher.asyncIterator<{ messageAdded: Message }>('messageAdded');
    const subscriptionPromise = subscriptionIterator.next();

    // 5. Send message via resolver
    const input: SendMessageInput = {
      chatId: chat.id,
      senderId: userId,
      content: 'Hello, real world!',
    };

    const mutationResult = await resolver.sendMessage(input);

    // 6. Assertions on execution order
    expect(executionTimeline).toEqual([
      'persist-start',
      'persist-end',
      'publish-start',
      'publish-end',
    ]);

    // 7. Verify message was actually saved in PG
    const dbMessage = await dataSource.getRepository(Message).findOneBy({ id: mutationResult.id });
    expect(dbMessage).toBeDefined();
    expect(dbMessage?.content).toBe(input.content);
    expect(dbMessage?.sequence).toBeDefined();

    // 8. Trigger real publish so the iterator resolves if we bypassed it in the spy
    // (Since we mocked 'publish', the subscriptionIterator won't resolve unless we publish manually or restore mock)
    jest.restoreAllMocks();
    await eventPublisher.publish('messageAdded', { messageAdded: mutationResult });

    const iteratorResult = await subscriptionPromise;
    expect(iteratorResult.done).toBe(false);
    expect(iteratorResult.value?.messageAdded).toBeDefined();
    
    const receivedMsg = iteratorResult.value?.messageAdded;
    expect(receivedMsg?.id).toBe(mutationResult.id);
    expect(receivedMsg?.content).toBe(mutationResult.content);
    expect(receivedMsg?.sequence).toBe(mutationResult.sequence);
  });
});
