import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  MinLength,
  ValidationError,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsIn(['development', 'production', 'test'])
  NODE_ENV = 'development';

  @IsInt()
  @Min(0)
  @Max(65535)
  PORT = 3000;

  @IsString()
  CORS_ORIGINS = 'http://localhost:5173';

  // Must include protocol: http://host:port or https://host:port — bare hosts like ollama:11434 are rejected
  @IsUrl({
    require_tld: false,
    require_protocol: true,
  })
  OLLAMA_URL = 'http://ollama:11434';

  // Must be a full postgres connection string: postgresql:// or postgres://
  @Matches(/^postgres(ql)?:\/\/.+/, {
    message: 'DATABASE_URL must start with postgresql:// or postgres://',
  })
  @IsString()
  DATABASE_URL!: string;

  @MinLength(1)
  @IsString()
  ANTHROPIC_API_KEY!: string;

  @IsBoolean()
  MOCK_AUTH = true;
}

type FormattedValidationError = {
  property: string;
  constraints: ValidationError['constraints'];
  value: unknown;
  children?: FormattedValidationError[];
};

function formatValidationErrors(errors: ValidationError[]): FormattedValidationError[] {
  return errors.map((error) => ({
    property: error.property,
    constraints: error.constraints,
    value: error.value as unknown,
    children: error.children?.length ? formatValidationErrors(error.children) : undefined,
  }));
}

function normalizePort(value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }

  return value;
}

function normalizeBoolean(value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }

  return value;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const normalizedPort = normalizePort(config.PORT);
  const normalizedMockAuth = normalizeBoolean(config.MOCK_AUTH);
  const normalizedConfig = {
    ...config,
    ...(config.PORT !== undefined ? { PORT: normalizedPort } : {}),
    ...(config.MOCK_AUTH !== undefined ? { MOCK_AUTH: normalizedMockAuth } : {}),
  };
  const validatedConfig = plainToInstance(EnvironmentVariables, normalizedConfig);
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${JSON.stringify(formatValidationErrors(errors), null, 2)}`,
    );
  }

  return validatedConfig;
}
