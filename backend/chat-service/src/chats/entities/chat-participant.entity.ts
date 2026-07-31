// AI-generated: ChatParticipant entity linking users to chat rooms
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@ObjectType()
@Entity('chat_participants')
@Unique(['chatId', 'userId'])
export class ChatParticipant {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('uuid')
  chatId: string;

  @Field()
  @Column('uuid')
  userId: string;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  joinedAt: Date;
}
