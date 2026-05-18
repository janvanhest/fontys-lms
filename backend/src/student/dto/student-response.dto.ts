import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id!: string;

  @ApiProperty({ example: '31474' })
  canvasUserId!: string;

  @ApiProperty({ example: 'Hest, Jan J.H. van' })
  displayName!: string;

  @ApiProperty({ example: 'jan.vanhest@student.fontys.nl' })
  email!: string;

  @ApiPropertyOptional({ example: 'https://avatars.githubusercontent.com/u/81753593?v=4' })
  avatarUrl!: string | null;

  @ApiProperty()
  createdAt!: Date;
}
