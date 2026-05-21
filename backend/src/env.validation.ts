import 'reflect-metadata';
import { Transform, plainToInstance } from 'class-transformer';
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
  NODE_ENV!: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  PORT!: number;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value
          .split(',')
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0)
      : value,
  )
  @IsUrl(
    { require_tld: false, require_protocol: true },
    {
      each: true,
      message:
        'Each CORS origin must include a protocol, e.g. http://host:port or https://host:port',
    },
  )
  CORS_ORIGINS!: string[];

  // Must include protocol: http://host:port or https://host:port — bare hosts like ollama:11434 are rejected
  @IsUrl({
    require_tld: false,
    require_protocol: true,
  })
  OLLAMA_URL!: string;

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
  MOCK_AUTH!: boolean;
}

type FormattedValidationError = {
  property: string;
  constraints: ValidationError['constraints'];
  value: unknown;
  children?: FormattedValidationError[];
};

const SENSITIVE_FIELDS = new Set(['ANTHROPIC_API_KEY', 'DATABASE_URL']);

function formatValidationErrors(errors: ValidationError[]): FormattedValidationError[] {
  return errors.map((error) => ({
    property: error.property,
    constraints: error.constraints,
    value: SENSITIVE_FIELDS.has(error.property) ? '***' : (error.value as unknown),
    children: error.children?.length ? formatValidationErrors(error.children) : undefined,
  }));
}

function normalizePort(value: unknown): number | string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }

  return typeof value === 'string' ? value : undefined;
}

function normalizeBoolean(value: unknown): boolean | string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  }

  return undefined;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const withDefaults: Record<string, unknown> = {
    NODE_ENV: 'development',
    PORT: 3000,
    CORS_ORIGINS: 'http://localhost:5173',
    MOCK_AUTH: false,
    ...config,
  };

  const normalizedPort = normalizePort(withDefaults.PORT);
  const normalizedMockAuth = normalizeBoolean(withDefaults.MOCK_AUTH);
  const normalizedConfig = {
    ...withDefaults,
    ...(withDefaults.PORT !== undefined ? { PORT: normalizedPort } : {}),
    ...(withDefaults.MOCK_AUTH !== undefined ? { MOCK_AUTH: normalizedMockAuth } : {}),
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
