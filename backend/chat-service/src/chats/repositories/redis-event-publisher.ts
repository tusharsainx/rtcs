// AI-generated: RedisEventPublisher adapter using graphql-redis-subscriptions and ioredis
import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { IEventPublisher } from '../interfaces/event-publisher.interface';

@Injectable()
export class RedisEventPublisher implements IEventPublisher, OnModuleDestroy {
  private readonly pubSub: RedisPubSub;
  constructor(
    @Inject('REDIS_PUBLISHER') private readonly redisPublisher: Redis,
    @Inject('REDIS_SUBSCRIBER') private readonly redisSubscriber: Redis,
  ) {
    this.pubSub = new RedisPubSub({
      publisher: this.redisPublisher,
      subscriber: this.redisSubscriber,
      reviver: (key, value) => {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
          return new Date(value);
        }
        return value;
      },
    });
  }

  async publish(triggerName: string, payload: any): Promise<void> {
    await this.pubSub.publish(triggerName, payload);
  }

  asyncIterator<T>(triggerName: string): AsyncIterator<T> {
    return this.pubSub.asyncIterator<T>(triggerName);
  }

  async onModuleDestroy() {
    await this.redisPublisher.quit();
    await this.redisSubscriber.quit();
  }
}
