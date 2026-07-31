import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async health() {
    try {
      // Query SELECT 1 to verify real-time PG connection health
      await this.dataSource.query('SELECT 1');
      return {
        status: 'UP',
        database: 'CONNECTED',
        graphql: 'READY',
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      throw new InternalServerErrorException({
        status: 'DOWN',
        database: 'DISCONNECTED',
        error: err.message,
      });
    }
  }
}
