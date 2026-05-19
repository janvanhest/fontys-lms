import { IsString, MinLength } from 'class-validator';

export class UpdateConversationTitleDto {
  @IsString()
  @MinLength(1)
  title!: string;
}
