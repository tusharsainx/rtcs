// AI-generated: UsersModule wiring dependencies and registering providers per the DIP rule
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import { UsersResolver } from './users.resolver';
import { TypeORMUserRepository } from './repositories/typeorm-user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UserService,
    UsersResolver,
    {
      provide: 'USER_REPOSITORY',
      useClass: TypeORMUserRepository,
    },
  ],
  exports: [UserService, 'USER_REPOSITORY'],
})
export class UsersModule {}
