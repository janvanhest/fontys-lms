import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Represents the payload structure for the echo endpoint.
 * This DTO ensures that the incoming message is a non-empty string.
 */
export class EchoMessageDto {
  /**
   * The textual message content sent to the echo endpoint.
   * This value must be provided and must be a valid string.
   */
  @ApiProperty({ example: 'Hallo Fontys' })
  @IsString()
  @IsNotEmpty()
  message!: string;
}
