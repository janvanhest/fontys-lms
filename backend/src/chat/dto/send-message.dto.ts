import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  message!: string;

  @IsUUID()
  @IsOptional()
  conversationId?: string;
}
