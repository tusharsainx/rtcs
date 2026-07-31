// AI-generated: Chat entity combining TypeORM and GraphQL ObjectType decorators
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column } from 'typeorm';

@ObjectType()
@Entity('chats')
export class Chat {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
