import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentStudent } from '../auth/decorators/current-student.decorator';
import { StudentResponseDto } from './dto/student-response.dto';
import { Student } from './student.entity';

@ApiTags('student')
@Controller('student')
export class StudentController {
  @Get('me')
  @ApiOperation({ summary: 'Get current student profile' })
  @ApiOkResponse({ type: StudentResponseDto })
  me(@CurrentStudent() student: Student): Student {
    return student;
  }
}
