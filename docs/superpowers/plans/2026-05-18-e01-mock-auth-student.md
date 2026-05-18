# E-01 Mock Auth + Student Profile — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement MockAuthGuard that upserts a hardcoded student on every request, expose `GET /student/me`, and show the student's avatar + profile menu in the Topbar.

**Architecture:** `AuthModule` registers `MockAuthGuard` globally via `APP_GUARD`; the guard calls `StudentService.findOrCreate()` and sets `request.user`. `StudentModule` exposes the entity and a single controller endpoint. The frontend fetches `/student/me` via TanStack Query and renders an MUI Avatar + Menu in the Topbar.

**Tech Stack:** NestJS, TypeORM (PostgreSQL, synchronize:true), `@nestjs/swagger`, React 19, MUI v7, TanStack Query, Storybook + Vitest browser

---

## File Map

### New — Backend
| File | Responsibility |
|---|---|
| `backend/src/auth/interfaces/authenticated-user.interface.ts` | Shared contract between guards and controllers |
| `backend/src/auth/decorators/public.decorator.ts` | `@Public()` — skips guard |
| `backend/src/auth/decorators/current-student.decorator.ts` | `@CurrentStudent()` — param decorator |
| `backend/src/auth/guards/mock-auth.guard.ts` | Upserts mock student, sets `request.user` |
| `backend/src/auth/guards/mock-auth.guard.spec.ts` | Unit tests for the guard |
| `backend/src/auth/auth.module.ts` | Registers `APP_GUARD`, exports decorators |
| `backend/src/student/student.entity.ts` | TypeORM entity |
| `backend/src/student/dto/student-response.dto.ts` | Swagger-annotated response shape |
| `backend/src/student/student.service.ts` | `findOrCreate` logic |
| `backend/src/student/student.service.spec.ts` | Unit tests for the service |
| `backend/src/student/student.controller.ts` | `GET /student/me` |
| `backend/src/student/student.controller.spec.ts` | Unit tests for the controller |
| `backend/src/student/student.module.ts` | Wires entity, service, controller |

### Modified — Backend
| File | Change |
|---|---|
| `backend/src/app.module.ts` | Import `AuthModule`, `StudentModule` |
| `backend/src/health/health.controller.ts` | Add `@Public()` |
| `backend/src/app.controller.ts` | Add `@Public()` |

### New — Frontend
| File | Responsibility |
|---|---|
| `frontend/src/api/student.ts` | TanStack Query options + `StudentProfile` type |
| `frontend/src/layouts/StudentMenu.tsx` | MUI Avatar + Menu component |

### Modified — Frontend
| File | Change |
|---|---|
| `frontend/.env` | Add `VITE_API_BASE_URL=http://localhost:3000` |
| `frontend/src/layouts/Topbar.tsx` | Replace `Chip` with `StudentMenu` |
| `frontend/src/layouts/Topbar.stories.tsx` | Add `WithProfile`, `LoadingProfile`, `MenuOpen` stories |

---

## Task 1: Student entity

**Files:**
- Create: `backend/src/student/student.entity.ts`

- [ ] **Create the entity file**

```ts
// backend/src/student/student.entity.ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  canvasUserId: string;

  @Column()
  displayName: string;

  @Column()
  email: string;

  @Column({ nullable: true, type: 'varchar' })
  avatarUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
```

- [ ] **Commit**

```bash
git add backend/src/student/student.entity.ts
git commit -m "feat(student): add Student entity"
```

---

## Task 2: StudentService (TDD)

**Files:**
- Create: `backend/src/student/student.service.ts`
- Create: `backend/src/student/student.service.spec.ts`

- [ ] **Write the failing tests**

```ts
// backend/src/student/student.service.spec.ts
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { StudentService } from './student.service';

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('StudentService', () => {
  let service: StudentService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: getRepositoryToken(Student), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(StudentService);
    repo = module.get(getRepositoryToken(Student));
  });

  const dto = {
    canvasUserId: '31474',
    displayName: 'Hest, Jan J.H. van',
    email: 'jan.vanhest@student.fontys.nl',
    avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
  };

  it('returns existing student without saving', async () => {
    const existing = { id: 'uuid-1', ...dto, createdAt: new Date() } as Student;
    repo.findOne.mockResolvedValue(existing);

    const result = await service.findOrCreate(dto);

    expect(result).toBe(existing);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('creates and saves new student when not found', async () => {
    const created = { id: 'uuid-2', ...dto, createdAt: new Date() } as Student;
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    const result = await service.findOrCreate(dto);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });
});
```

- [ ] **Run tests — verify they fail**

```bash
cd backend && pnpm test -- --testPathPattern=student.service --verbose
```

Expected: FAIL — `StudentService` cannot be found

- [ ] **Implement StudentService**

```ts
// backend/src/student/student.service.ts
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
```

- [ ] **Run tests — verify they pass**

```bash
cd backend && pnpm test -- --testPathPattern=student.service --verbose
```

Expected: PASS — 2 tests

- [ ] **Commit**

```bash
git add backend/src/student/student.service.ts backend/src/student/student.service.spec.ts
git commit -m "feat(student): add StudentService with findOrCreate"
```

---

## Task 3: StudentModule

**Files:**
- Create: `backend/src/student/dto/student-response.dto.ts`
- Create: `backend/src/student/student.module.ts`

- [ ] **Create StudentResponseDto**

```ts
// backend/src/student/dto/student-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ example: '31474' })
  canvasUserId: string;

  @ApiProperty({ example: 'Hest, Jan J.H. van' })
  displayName: string;

  @ApiProperty({ example: 'jan.vanhest@student.fontys.nl' })
  email: string;

  @ApiPropertyOptional({ example: 'https://avatars.githubusercontent.com/u/81753593?v=4' })
  avatarUrl: string | null;

  @ApiProperty()
  createdAt: Date;
}
```

- [ ] **Create StudentModule**

```ts
// backend/src/student/student.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
```

Note: `StudentController` doesn't exist yet — create it as a placeholder:

```ts
// backend/src/student/student.controller.ts (placeholder)
import { Controller } from '@nestjs/common';

@Controller('student')
export class StudentController {}
```

- [ ] **Commit**

```bash
git add backend/src/student/
git commit -m "feat(student): add StudentModule and StudentResponseDto"
```

---

## Task 4: Auth interface + decorators

**Files:**
- Create: `backend/src/auth/interfaces/authenticated-user.interface.ts`
- Create: `backend/src/auth/decorators/public.decorator.ts`
- Create: `backend/src/auth/decorators/current-student.decorator.ts`

- [ ] **Create IAuthenticatedUser**

```ts
// backend/src/auth/interfaces/authenticated-user.interface.ts
export interface IAuthenticatedUser {
  id: string;
  canvasUserId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}
```

- [ ] **Create @Public() decorator**

```ts
// backend/src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

- [ ] **Create @CurrentStudent() decorator**

```ts
// backend/src/auth/decorators/current-student.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Student } from '../../student/student.entity';

export const CurrentStudent = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Student => {
    return ctx.switchToHttp().getRequest().user as Student;
  },
);
```

- [ ] **Commit**

```bash
git add backend/src/auth/
git commit -m "feat(auth): add IAuthenticatedUser interface and decorators"
```

---

## Task 5: MockAuthGuard (TDD)

**Files:**
- Create: `backend/src/auth/guards/mock-auth.guard.spec.ts`
- Create: `backend/src/auth/guards/mock-auth.guard.ts`

- [ ] **Write the failing tests**

```ts
// backend/src/auth/guards/mock-auth.guard.spec.ts
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { StudentService } from '../../student/student.service';
import { Student } from '../../student/student.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { MockAuthGuard } from './mock-auth.guard';

const mockStudentService = () => ({ findOrCreate: jest.fn() });
const mockReflector = () => ({ getAllAndOverride: jest.fn() });

function buildContext(isPublic: boolean, request: Record<string, unknown> = {}): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('MockAuthGuard', () => {
  let guard: MockAuthGuard;
  let studentService: ReturnType<typeof mockStudentService>;
  let reflector: ReturnType<typeof mockReflector>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockAuthGuard,
        { provide: StudentService, useFactory: mockStudentService },
        { provide: Reflector, useFactory: mockReflector },
      ],
    }).compile();

    guard = module.get(MockAuthGuard);
    studentService = module.get(StudentService);
    reflector = module.get(Reflector);
  });

  it('allows public routes without calling StudentService', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const result = await guard.canActivate(buildContext(true));

    expect(result).toBe(true);
    expect(studentService.findOrCreate).not.toHaveBeenCalled();
  });

  it('calls findOrCreate and sets request.user for protected routes', async () => {
    const student = { id: 'uuid-1', canvasUserId: '31474' } as Student;
    reflector.getAllAndOverride.mockReturnValue(false);
    studentService.findOrCreate.mockResolvedValue(student);
    const request: Record<string, unknown> = {};

    const result = await guard.canActivate(buildContext(false, request));

    expect(result).toBe(true);
    expect(studentService.findOrCreate).toHaveBeenCalledWith({
      canvasUserId: '31474',
      displayName: 'Hest, Jan J.H. van',
      email: 'jan.vanhest@student.fontys.nl',
      avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
    });
    expect(request.user).toBe(student);
  });
});
```

- [ ] **Run tests — verify they fail**

```bash
cd backend && pnpm test -- --testPathPattern=mock-auth.guard --verbose
```

Expected: FAIL — `MockAuthGuard` cannot be found

- [ ] **Implement MockAuthGuard**

```ts
// backend/src/auth/guards/mock-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StudentService } from '../../student/student.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

const MOCK_STUDENT = {
  canvasUserId: '31474',
  displayName: 'Hest, Jan J.H. van',
  email: 'jan.vanhest@student.fontys.nl',
  avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
};

@Injectable()
export class MockAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly studentService: StudentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{ user: unknown }>();
    request.user = await this.studentService.findOrCreate(MOCK_STUDENT);
    return true;
  }
}
```

- [ ] **Run tests — verify they pass**

```bash
cd backend && pnpm test -- --testPathPattern=mock-auth.guard --verbose
```

Expected: PASS — 2 tests

- [ ] **Commit**

```bash
git add backend/src/auth/guards/
git commit -m "feat(auth): add MockAuthGuard with findOrCreate + public route bypass"
```

---

## Task 6: AuthModule + wire into AppModule

**Files:**
- Create: `backend/src/auth/auth.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Create AuthModule**

```ts
// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { StudentModule } from '../student/student.module';
import { MockAuthGuard } from './guards/mock-auth.guard';

@Module({
  imports: [StudentModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: MockAuthGuard,
    },
  ],
})
export class AuthModule {}
```

- [ ] **Register AuthModule and StudentModule in AppModule**

```ts
// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { DocumentModule } from './document/document.module';
import { validate } from './env.validation';
import { HealthModule } from './health/health.module';
import { StudentModule } from './student/student.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    DatabaseModule,
    AuthModule,
    StudentModule,
    HealthModule,
    DocumentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Run all backend tests to verify nothing broke**

```bash
cd backend && pnpm test -- --verbose
```

Expected: all existing tests still PASS

- [ ] **Commit**

```bash
git add backend/src/auth/auth.module.ts backend/src/app.module.ts
git commit -m "feat(auth): register AuthModule globally with APP_GUARD"
```

---

## Task 7: Mark public routes

**Files:**
- Modify: `backend/src/health/health.controller.ts`
- Modify: `backend/src/app.controller.ts`

- [ ] **Add @Public() to HealthController**

```ts
// backend/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ type: HealthCheckResponseDto })
  async check(): Promise<HealthCheckResponseDto> {
    return this.healthService.check();
  }
}
```

- [ ] **Add @Public() to AppController**

```ts
// backend/src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';
import { AppInfoResponseDto } from './app-info-response.dto';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'API info' })
  @ApiOkResponse({ type: AppInfoResponseDto })
  getInfo(): AppInfoResponseDto {
    return this.appService.getInfo();
  }
}
```

- [ ] **Run all backend tests**

```bash
cd backend && pnpm test -- --verbose
```

Expected: PASS

- [ ] **Commit**

```bash
git add backend/src/health/health.controller.ts backend/src/app.controller.ts
git commit -m "feat(auth): mark health and info endpoints as public"
```

---

## Task 8: StudentController (TDD)

**Files:**
- Create: `backend/src/student/student.controller.spec.ts`
- Modify: `backend/src/student/student.controller.ts`

- [ ] **Write the failing test**

```ts
// backend/src/student/student.controller.spec.ts
import { Test } from '@nestjs/testing';
import { Student } from './student.entity';
import { StudentController } from './student.controller';

describe('StudentController', () => {
  let controller: StudentController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [StudentController],
    }).compile();
    controller = module.get(StudentController);
  });

  it('GET /student/me returns the student from request.user', () => {
    const student = {
      id: 'uuid-1',
      canvasUserId: '31474',
      displayName: 'Hest, Jan J.H. van',
      email: 'jan.vanhest@student.fontys.nl',
      avatarUrl: null,
      createdAt: new Date(),
    } as Student;

    expect(controller.me(student)).toBe(student);
  });
});
```

- [ ] **Run test — verify it fails**

```bash
cd backend && pnpm test -- --testPathPattern=student.controller --verbose
```

Expected: FAIL — `me` is not a function

- [ ] **Implement StudentController**

```ts
// backend/src/student/student.controller.ts
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
```

- [ ] **Run test — verify it passes**

```bash
cd backend && pnpm test -- --testPathPattern=student.controller --verbose
```

Expected: PASS — 1 test

- [ ] **Run all backend tests**

```bash
cd backend && pnpm test -- --verbose
```

Expected: all PASS

- [ ] **Commit**

```bash
git add backend/src/student/student.controller.ts backend/src/student/student.controller.spec.ts
git commit -m "feat(student): add GET /student/me endpoint"
```

---

## Task 9: Frontend env + TanStack Query student options

**Files:**
- Modify: `frontend/.env`
- Create: `frontend/src/api/student.ts`

- [ ] **Add backend base URL to env**

Append to `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:3000
```

- [ ] **Create student API module**

```ts
// frontend/src/api/student.ts
import { queryOptions } from '@tanstack/react-query';

export interface StudentProfile {
  id: string;
  canvasUserId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';

export const studentProfileOptions = queryOptions({
  queryKey: ['student', 'me'],
  queryFn: async (): Promise<StudentProfile> => {
    const res = await fetch(`${apiBase}/student/me`);
    if (!res.ok) throw new Error('Kon studentprofiel niet ophalen');
    return res.json() as Promise<StudentProfile>;
  },
  staleTime: Infinity,
});

export function studentInitials(displayName: string): string {
  return displayName
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');
}
```

- [ ] **Commit**

```bash
git add frontend/.env frontend/src/api/student.ts
git commit -m "feat(frontend): add student API options and StudentProfile type"
```

---

## Task 10: StudentMenu component

**Files:**
- Create: `frontend/src/layouts/StudentMenu.tsx`

- [ ] **Create StudentMenu**

```tsx
// frontend/src/layouts/StudentMenu.tsx
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { studentInitials, type StudentProfile } from '@/api/student';

interface Props {
  student: StudentProfile | undefined;
}

export function StudentMenu({ student }: Props) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const initials = student ? studentInitials(student.displayName) : '?';

  return (
    <>
      <IconButton
        onClick={(e) => { setAnchor(e.currentTarget); }}
        aria-label="Studentprofiel"
        sx={{ p: 0.5 }}
      >
        <Avatar
          src={student?.avatarUrl ?? undefined}
          alt={student?.displayName}
          sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'primary.dark' }}
        >
          {initials}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => { setAnchor(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
          <Typography variant="subtitle2" noWrap>
            {student?.displayName ?? '...'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {student?.email ?? ''}
          </Typography>
        </Box>
        <Divider />
        <MenuItem disabled>
          <ListItemText>Uitloggen</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
```

- [ ] **Commit**

```bash
git add frontend/src/layouts/StudentMenu.tsx
git commit -m "feat(frontend): add StudentMenu component with Avatar and profile Menu"
```

---

## Task 11: Update Topbar

**Files:**
- Modify: `frontend/src/layouts/Topbar.tsx`

- [ ] **Replace Chip with StudentMenu in Topbar**

```tsx
// frontend/src/layouts/Topbar.tsx
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import type { LayoutTab } from '@/context/layout-context';
import { useLayout } from '@/context/useLayout';
import { studentProfileOptions } from '@/api/student';
import { StudentMenu } from './StudentMenu';

const tabOptions: Array<{ label: string; value: LayoutTab }> = [
  { label: 'Chat', value: 'chat' },
  { label: 'Activities', value: 'activities' },
  { label: 'Challenge', value: 'challenge' },
  { label: 'Competenties', value: 'competenties' },
  { label: 'Stappenplan', value: 'stappenplan' },
];

export function Topbar() {
  const { activeTab, selectTab, sidebarOpen, setSidebarOpen } = useLayout();
  const { data: student } = useQuery(studentProfileOptions);

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar
        sx={{
          gap: 2,
          alignItems: 'center',
          minHeight: { xs: 72, md: 80 },
          px: { xs: 2, md: 3 },
        }}
      >
        <IconButton
          aria-label="Toggle sidebar"
          onClick={() => { setSidebarOpen(!sidebarOpen); }}
          edge="start"
          sx={{ color: 'common.white' }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{ whiteSpace: 'nowrap', letterSpacing: '0.02em', color: 'common.white' }}
        >
          Fontys LMS
        </Typography>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(_event, value: LayoutTab) => { selectTab(value); }}
            textColor="inherit"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 56,
              '& .MuiTabs-indicator': { height: 3, backgroundColor: 'common.white' },
              '& .MuiTab-root': { minHeight: 56, fontWeight: 600, color: 'rgba(255,255,255,0.72)' },
              '& .MuiTab-root:hover': { color: 'common.white' },
              '& .MuiTab-root.Mui-selected': { color: 'common.white' },
            }}
          >
            {tabOptions.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        <StudentMenu student={student} />
      </Toolbar>
    </AppBar>
  );
}
```

- [ ] **Commit**

```bash
git add frontend/src/layouts/Topbar.tsx
git commit -m "feat(frontend): replace Coach chip with StudentMenu in Topbar"
```

---

## Task 12: Storybook stories

**Files:**
- Modify: `frontend/src/layouts/Topbar.stories.tsx`

Note: Stories mocken de TanStack Query cache via een per-story `QueryClient` zodat er geen echte fetch plaatsvindt. Zorg dat `QueryClientProvider` beschikbaar is — installeer `@tanstack/react-query` als dat nog niet in het frontend `package.json` zit (controleer met `grep tanstack frontend/package.json`).

- [ ] **Update Topbar.stories.tsx**

```tsx
// frontend/src/layouts/Topbar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { StudentProfile } from '@/api/student';
import { studentProfileOptions } from '@/api/student';
import { LayoutStoryProvider } from '@/storybook/LayoutStoryProvider';
import { Topbar } from './Topbar';

const meta: Meta<typeof Topbar> = {
  title: 'Layouts/Topbar',
  component: Topbar,
};
export default meta;
type Story = StoryObj<typeof Topbar>;

const mockStudent: StudentProfile = {
  id: 'uuid-1',
  canvasUserId: '31474',
  displayName: 'Hest, Jan J.H. van',
  email: 'jan.vanhest@student.fontys.nl',
  avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
  createdAt: '2026-05-18T00:00:00.000Z',
};

function withStudent(student?: StudentProfile) {
  const qc = new QueryClient();
  if (student) {
    qc.setQueryData(studentProfileOptions.queryKey, student);
  }
  return (Story: React.ComponentType) => (
    <QueryClientProvider client={qc}>
      <Story />
    </QueryClientProvider>
  );
}

export const WithProfile: Story = {
  decorators: [withStudent(mockStudent)],
  render: () => (
    <LayoutStoryProvider>
      <Topbar />
    </LayoutStoryProvider>
  ),
};

export const LoadingProfile: Story = {
  decorators: [withStudent(undefined)],
  render: () => (
    <LayoutStoryProvider>
      <Topbar />
    </LayoutStoryProvider>
  ),
};

export const Default: Story = {
  decorators: [withStudent(mockStudent)],
  render: () => (
    <LayoutStoryProvider>
      <Topbar />
    </LayoutStoryProvider>
  ),
};

export const SidebarClosed: Story = {
  decorators: [withStudent(mockStudent)],
  render: () => (
    <LayoutStoryProvider sidebarOpen={false}>
      <Topbar />
    </LayoutStoryProvider>
  ),
};

export const ActivitiesTab: Story = {
  decorators: [withStudent(mockStudent)],
  render: () => (
    <LayoutStoryProvider activeTab="activities" sidePanelOpen>
      <Topbar />
    </LayoutStoryProvider>
  ),
};
```

- [ ] **Verify Storybook renders correctly**

```bash
cd frontend && pnpm storybook
```

Open `http://localhost:6006` → Layouts/Topbar → controleer `WithProfile` (avatar zichtbaar), `LoadingProfile` (initialen als fallback).

- [ ] **Commit**

```bash
git add frontend/src/layouts/Topbar.stories.tsx
git commit -m "feat(frontend): update Topbar stories with student profile variants"
```

---

## Self-Review

**Spec coverage:**
- FR-05a MockAuthGuard injecteert naam, email, student-id: ✓ Task 5
- Dezelfde interface als LtiAuthGuard: ✓ `IAuthenticatedUser` in Task 4
- Student hoeft niet in te loggen: ✓ guard is globaal, geen login flow
- Student entity + DB: ✓ Task 1-3
- `GET /student/me`: ✓ Task 8
- Guard globaal: ✓ Task 6 via `APP_GUARD`
- `@Public()` op health/info: ✓ Task 7
- Frontend Avatar + Menu: ✓ Task 10-11
- Storybook stories: ✓ Task 12

**Placeholder scan:** geen TBD's of TODO's aanwezig.

**Type consistency:**
- `FindOrCreateDto` in Task 2 matcht de aanroep in Task 5 (`MOCK_STUDENT` heeft exact dezelfde keys)
- `StudentProfile` in Task 9 matcht `StudentResponseDto` in Task 3 (zelfde velden)
- `studentProfileOptions.queryKey` in Task 9 gebruikt als cache key in Task 12 stories
- `StudentMenu` accepteert `student: StudentProfile | undefined` — Topbar geeft `data` van `useQuery` door, type is `StudentProfile | undefined` ✓
