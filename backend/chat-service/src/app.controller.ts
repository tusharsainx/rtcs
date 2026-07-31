import { Controller, Get, Inject, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
    @Inject('REDIS_PUBLISHER')
    private readonly redisPublisher: Redis,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async health() {
    try {
      // 1. Query SELECT 1 to verify PG database connectivity
      await this.dataSource.query('SELECT 1');
      
      // 2. Ping Redis broker to verify cache/PubSub connectivity
      await this.redisPublisher.ping();
      
      return {
        status: 'UP',
        database: 'CONNECTED',
        redis: 'CONNECTED',
        graphql: 'READY',
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      throw new InternalServerErrorException({
        status: 'DOWN',
        database: 'DISCONNECTED_OR_REDIS_DISCONNECTED',
        error: err.message,
      });
    }
  }
}
