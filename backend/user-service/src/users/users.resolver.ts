// AI-generated: UsersResolver exposing createUser and login mutations, and user/users queries in GraphQL
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { LoginInput } from './dto/login.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UserService) {}

  @Mutation(() => User)
  async createUser(
    @Args('input') input: CreateUserInput,
  ): Promise<User> {
    return this.usersService.createUser(input.name, input.email, input.password);
  }

  @Mutation(() => User)
  async login(
    @Args('input') input: LoginInput,
  ): Promise<User> {
    return this.usersService.login(input.email, input.password);
  }

  @Query(() => User, { name: 'user' })
  async getUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<User> {
    return this.usersService.getUserById(id);
  }

  @Query(() => [User], { name: 'users' })
  async getUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  @Query(() => String, { name: 'userServiceInstance' })
  getUserServiceInstance(): string {
    return process.env.INSTANCE_NAME || 'user-service-instance-1';
  }
}
