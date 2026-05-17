import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let healthCheckService: jest.Mocked<Pick<HealthCheckService, 'check'>>;

  beforeEach(async () => {
    const mockHealthCheckService = { check: jest.fn() };
    const mockDb = { pingCheck: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: mockDb },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    healthCheckService = module.get(HealthCheckService);
  });

  it('returns { status: "ok" } when database is healthy', async () => {
    healthCheckService.check.mockResolvedValue({
      status: 'ok',
      details: { database: { status: 'up' } },
    } as never);

    const result = await service.check();

    expect(result).toEqual({ status: 'ok' });
  });

  it('returns { status: "error", details } when database is unhealthy', async () => {
    const causes = { database: { status: 'down', message: 'Connection refused' } };
    healthCheckService.check.mockRejectedValue(new HealthCheckError('DB check failed', causes));

    const result = await service.check();

    expect(result).toEqual({ status: 'error', details: causes });
  });

  it('returns { status: "error", details } on unexpected error', async () => {
    healthCheckService.check.mockRejectedValue(new Error('Unexpected'));

    const result = await service.check();

    expect(result.status).toBe('error');
    expect(result.details).toBeDefined();
  });
});
