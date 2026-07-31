// AI-generated: Message entity containing the monotonic sequence column for ordering
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@ObjectType()
@Entity('messages')
export class Message {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('uuid')
  chatId: string;

  @Field()
  @Column('uuid')
  senderId: string;

  @Field()
  @Column('text')
  content: string;

  @Field(() => Int)
  @Column({
    type: 'bigint',
    generated: 'increment',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value, 10),
    },
  })
  sequence: number;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
