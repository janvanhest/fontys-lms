import { ApiProperty } from '@nestjs/swagger';

export class AppInfoResponseDto {
  @ApiProperty({ example: 'fontys-lms-backend' })
  name!: string;

  @ApiProperty({ example: '0.0.1' })
  version!: string;
}
