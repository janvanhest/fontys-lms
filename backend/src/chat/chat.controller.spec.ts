import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, toArray } from 'rxjs';
import { Student } from '../student/student.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConversationService } from './conversation.service';

describe('ChatController', () => {
  let controller: ChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: {
            async *streamResponse() {
              yield { event: 'status', data: 'Thinking...' };
              yield { event: 'final', data: 'Done.' };
            },
          },
        },
        { provide: ConversationService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('emits SSE MessageEvent items with type and plain data', async () => {
    const student = { id: 'student-1' } as Student;

    const events = await firstValueFrom(
      controller.stream({ message: 'Hallo' }, student).pipe(toArray()),
    );

    expect(events).toEqual([
      { type: 'status', data: 'Thinking...' },
      { type: 'final', data: 'Done.' },
    ]);
  });
});
