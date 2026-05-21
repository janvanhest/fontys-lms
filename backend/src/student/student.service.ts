import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';

interface FindOrCreateDto {
  canvasUserId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly repo: Repository<Student>,
  ) {}

  async findOrCreate(dto: FindOrCreateDto): Promise<Student> {
    const existing = await this.repo.findOne({
      where: { canvasUserId: dto.canvasUserId },
    });
    if (existing) return existing;

    const student = this.repo.create(dto);
    return this.repo.save(student);
  }
}
