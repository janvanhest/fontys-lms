import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { IsIn, IsNumber, IsString, Max, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsIn(['development', 'production', 'test', 'provision'])
  NODE_ENV = 'development';

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT = 3000;

  @IsString()
  CORS_ORIGINS = 'http://localhost:5173';
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const normalizedPort = config.PORT === undefined ? 3000 : Number(config.PORT);
  const normalizedConfig = {
    NODE_ENV: 'development',
    CORS_ORIGINS: 'http://localhost:5173',
    ...config,
    PORT: normalizedPort,
  };
  const validatedConfig = plainToInstance(EnvironmentVariables, normalizedConfig, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
