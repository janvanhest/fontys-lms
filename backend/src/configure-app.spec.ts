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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers the global validation pipe', () => {
    const useGlobalPipes = jest.fn<void, [ValidationPipe]>();
    const app = {
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

      await expect(
        pipe.transform<EchoMessageDto>({ message: 'Hallo Fontys' }, metadata),
      ).resolves.toBeInstanceOf(EchoMessageDto);
      await expect(
        pipe.transform<EchoMessageDto>({ message: 'Hallo Fontys' }, metadata),
      ).resolves.toEqual({ message: 'Hallo Fontys' });
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
