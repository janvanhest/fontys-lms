import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { IsIn, IsInt, IsString, Max, Min, ValidationError, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsIn(['development', 'production', 'test', 'provision'])
  NODE_ENV = 'development';

  @IsInt()
  @Min(0)
  @Max(65535)
  PORT = 3000;

  @IsString()
  CORS_ORIGINS = 'http://localhost:5173';
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
    value: error.value,
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

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const normalizedPort = normalizePort(config.PORT);
  const normalizedConfig = {
    ...config,
    ...(config.PORT !== undefined ? { PORT: normalizedPort } : {}),
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
