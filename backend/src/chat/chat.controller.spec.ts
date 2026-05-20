import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, toArray } from 'rxjs';
import { Student } from '../student/student.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConversationService } from './conversation.service';

describe('ChatController', () => {
  let controller: ChatController;
  let conversationService: { updateConversationTitle: jest.Mock };

  beforeEach(async () => {
    conversationService = {
      updateConversationTitle: jest.fn().mockResolvedValue(undefined),
    };

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
        { provide: ConversationService, useValue: conversationService },
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

  it('converts thrown chat errors into SSE error events', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: {
            async *streamResponse() {
              throw new Error('Course search unavailable');
            },
          },
        },
        { provide: ConversationService, useValue: conversationService },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    const student = { id: 'student-1' } as Student;

    const events = await firstValueFrom(
      controller.stream({ message: 'Hallo' }, student).pipe(toArray()),
    );

    expect(events).toEqual([{ type: 'error', data: 'Course search unavailable' }]);
  });

  it('forwards conversation title updates with the current student id', async () => {
    const student = { id: 'student-1' } as Student;

    await controller.updateConversationTitle(
      'conversation-1',
      { title: 'Semesterplan hulp' },
      student,
    );

    expect(conversationService.updateConversationTitle).toHaveBeenCalledWith(
      'conversation-1',
      'student-1',
      'Semesterplan hulp',
    );
  });

  it('getConversation passes the current student id to the conversation service', async () => {
    const findConversationWithMessages = jest.fn().mockResolvedValue({
      id: 'conv-1',
      studentId: 'student-1',
      messages: [],
    });
    const module2: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: { async *streamResponse() {} } },
        {
          provide: ConversationService,
          useValue: { findConversationWithMessages, updateConversationTitle: jest.fn() },
        },
      ],
    }).compile();
    const ctrl = module2.get<ChatController>(ChatController);
    const student = { id: 'student-1' } as Student;

    await ctrl.getConversation('conv-1', student);

    expect(findConversationWithMessages).toHaveBeenCalledWith('conv-1', 'student-1');
  });
});
