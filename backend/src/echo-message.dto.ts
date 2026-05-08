import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EchoMessageDto {
  @ApiProperty({ example: 'Hallo Fontys' })
  @IsString()
  @IsNotEmpty()
  message!: string;
}
