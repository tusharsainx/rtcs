// AI-generated: Entrypoint main.ts configuring global ValidationPipe
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE'];
  for (const envName of requiredEnv) {
    if (!process.env[envName]) {
      throw new Error(`Bootstrap Error: Environment variable ${envName} is required but missing!`);
    }
  }

  const app = await NestFactory.create(AppModule);
  
  // Enable shutdown hooks for graceful termination (e.g. TypeORM / Redis connections)
  app.enableShutdownHooks();
  
  // Enable global DTO validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`User Service is running on port ${port}`);
}
bootstrap();
