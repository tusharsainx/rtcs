// AI-generated: DTO for sending a message
import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class SendMessageInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  chatId: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  senderId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;
}
