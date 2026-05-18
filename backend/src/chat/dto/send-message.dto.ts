import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  vraag!: string;

  @IsUUID()
  @IsOptional()
  gesprekId?: string;
}
