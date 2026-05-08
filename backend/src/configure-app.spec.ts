import {
  ArgumentMetadata,
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { configureApp, globalValidationPipeOptions } from './configure-app';
import { EchoMessageDto } from './echo-message.dto';

jest.mock('@nestjs/swagger', () => ({
  ApiProperty: () => () => undefined,
  DocumentBuilder: class {
    setTitle() {
      return this;
    }
    setDescription() {
      return this;
    }
    setVersion() {
      return this;
    }
    build() {
      return {};
    }
  },
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({}),
    setup: jest.fn(),
  },
}));

describe('configureApp', () => {
  const originalCorsOrigins = process.env.CORS_ORIGINS;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.CORS_ORIGINS;
  });

  afterAll(() => {
    if (originalCorsOrigins === undefined) {
      delete process.env.CORS_ORIGINS;
      return;
    }

    process.env.CORS_ORIGINS = originalCorsOrigins;
  });

  it('registers the default localhost frontend origin for CORS', () => {
    const enableCors = jest.fn();
    const app = {
      enableCors,
      useGlobalPipes: jest.fn<void, [ValidationPipe]>(),
      getHttpAdapter: jest.fn().mockReturnValue({}),
    } as unknown as INestApplication;

    configureApp(app);

    expect(enableCors).toHaveBeenCalledTimes(1);
    expect(enableCors).toHaveBeenCalledWith({
      origin: ['http://localhost:5173'],
    });
  });

  it('registers env-configured CORS origins', () => {
    process.env.CORS_ORIGINS = 'http://localhost:5173, https://frontend.example.com  ,';
    const enableCors = jest.fn();
    const app = {
      enableCors,
      useGlobalPipes: jest.fn<void, [ValidationPipe]>(),
      getHttpAdapter: jest.fn().mockReturnValue({}),
    } as unknown as INestApplication;

    configureApp(app);

    expect(enableCors).toHaveBeenCalledTimes(1);
    expect(enableCors).toHaveBeenCalledWith({
      origin: ['http://localhost:5173', 'https://frontend.example.com'],
    });
  });

  it('registers the global validation pipe', () => {
    const useGlobalPipes = jest.fn<void, [ValidationPipe]>();
    const enableCors = jest.fn();
    const app = {
      enableCors,
      useGlobalPipes,
      getHttpAdapter: jest.fn().mockReturnValue({}),
    } as unknown as INestApplication;

    configureApp(app);

    expect(useGlobalPipes).toHaveBeenCalledTimes(1);
    expect(useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
  });

  describe('globalValidationPipeOptions', () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: EchoMessageDto,
      data: '',
    };

    it('transforms and accepts a valid DTO payload', async () => {
      const pipe = new ValidationPipe(globalValidationPipeOptions);

      await expect(pipe.transform({ message: 'Hallo Fontys' }, metadata)).resolves.toBeInstanceOf(
        EchoMessageDto,
      );
      await expect(pipe.transform({ message: 'Hallo Fontys' }, metadata)).resolves.toEqual({
        message: 'Hallo Fontys',
      });
    });

    it('rejects unknown properties', async () => {
      const pipe = new ValidationPipe(globalValidationPipeOptions);

      await expect(
        pipe.transform({ message: 'Hallo Fontys', extra: true }, metadata),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects missing required properties', async () => {
      const pipe = new ValidationPipe(globalValidationPipeOptions);

      await expect(pipe.transform({}, metadata)).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
