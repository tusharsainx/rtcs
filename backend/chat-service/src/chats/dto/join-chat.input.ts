// AI-generated: DTO for joining a chat room
import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty } from 'class-validator';

@InputType()
export class JoinChatInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  chatId: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
