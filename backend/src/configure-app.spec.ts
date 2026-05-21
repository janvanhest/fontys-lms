import {
  ArgumentMetadata,
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configureApp, globalValidationPipeOptions } from './configure-app';

class TestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message!: string;
}

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers the default localhost frontend origin for CORS', () => {
    const enableCors = jest.fn();
    const configService = {
      getOrThrow: jest.fn().mockReturnValue(['http://localhost:5173']),
    } as unknown as ConfigService;
    const app = {
      enableCors,
      useGlobalPipes: jest.fn<void, [ValidationPipe]>(),
      getHttpAdapter: jest.fn().mockReturnValue({}),
    } as unknown as INestApplication;

    configureApp(app, configService);

    expect(enableCors).toHaveBeenCalledTimes(1);
    expect(enableCors).toHaveBeenCalledWith({
      origin: ['http://localhost:5173'],
    });
  });

  it('registers config-driven CORS origins', () => {
    const enableCors = jest.fn();
    const configService = {
      getOrThrow: jest
        .fn()
        .mockReturnValue(['http://localhost:5173', 'https://frontend.example.com']),
    } as unknown as ConfigService;
    const app = {
      enableCors,
      useGlobalPipes: jest.fn<void, [ValidationPipe]>(),
      getHttpAdapter: jest.fn().mockReturnValue({}),
    } as unknown as INestApplication;

    configureApp(app, configService);

    expect(enableCors).toHaveBeenCalledTimes(1);
    expect(enableCors).toHaveBeenCalledWith({
      origin: ['http://localhost:5173', 'https://frontend.example.com'],
    });
  });

  it('registers the global validation pipe', () => {
    const useGlobalPipes = jest.fn<void, [ValidationPipe]>();
    const enableCors = jest.fn();
    const configService = {
      getOrThrow: jest.fn().mockReturnValue(['http://localhost:5173']),
    } as unknown as ConfigService;
    const app = {
      enableCors,
      useGlobalPipes,
      getHttpAdapter: jest.fn().mockReturnValue({}),
    } as unknown as INestApplication;

    configureApp(app, configService);

    expect(useGlobalPipes).toHaveBeenCalledTimes(1);
    expect(useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
  });

  describe('globalValidationPipeOptions', () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestDto,
      data: '',
    };

    it('transforms and accepts a valid DTO payload', async () => {
      const pipe = new ValidationPipe(globalValidationPipeOptions);

      await expect(pipe.transform({ message: 'Hallo Fontys' }, metadata)).resolves.toBeInstanceOf(
        TestDto,
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
