import { ApiProperty } from '@nestjs/swagger';

export class ToolCallTraceDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ type: Object })
  input: any;

  @ApiProperty({ type: Object })
  result: any;
}

export class ChatResponseDto {
  @ApiProperty({ description: 'Het uiteindelijke tekstantwoord van Claude.' })
  answer: string;

  @ApiProperty({ type: [ToolCallTraceDto], description: 'Welke tools Claude heeft aangeroepen tijdens dit antwoord. Goed om aan Coen/Marc te laten zien.' })
  tool_calls: ToolCallTraceDto[];
}
