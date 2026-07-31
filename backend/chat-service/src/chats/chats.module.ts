// AI-generated: ChatsModule configuring and wiring dependencies for the chats domain
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { Message } from './entities/message.entity';
import { ChatsService } from './chats.service';
import { ChatsResolver } from './chats.resolver';
import { TypeORMChatRepository } from './repositories/typeorm-chat.repository';
import { TypeORMMessageRepository } from './repositories/typeorm-message.repository';
import { RedisEventPublisher } from './repositories/redis-event-publisher';
import Redis from 'ioredis';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatParticipant, Message])],
  providers: [
    ChatsService,
    ChatsResolver,
    {
      provide: 'CHAT_REPOSITORY',
      useClass: TypeORMChatRepository,
    },
    {
      provide: 'MESSAGE_REPOSITORY',
      useClass: TypeORMMessageRepository,
    },
    {
      provide: 'REDIS_PUBLISHER',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        });
      },
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        });
      },
    },
    {
      provide: 'EVENT_PUBLISHER',
      useClass: RedisEventPublisher,
    },
  ],
  exports: [ChatsService, 'CHAT_REPOSITORY', 'MESSAGE_REPOSITORY', 'EVENT_PUBLISHER', 'REDIS_PUBLISHER'],
})
export class ChatsModule {}
