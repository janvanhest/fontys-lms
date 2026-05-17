import { validate } from './env.validation';

const validBase = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/lms',
};

describe('validate', () => {
  it('applies defaults for runtime config', () => {
    const config = validate({ ...validBase });

    expect(config.NODE_ENV).toBe('development');
    expect(config.PORT).toBe(3000);
    expect(config.CORS_ORIGINS).toBe('http://localhost:5173');
    expect(config.OLLAMA_URL).toBe('http://ollama:11434');
  });

  it('accepts explicit env values', () => {
    const config = validate({
      ...validBase,
      NODE_ENV: 'test',
      PORT: '4000',
      CORS_ORIGINS: 'http://localhost:5173,https://frontend.example.com',
    });

    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(4000);
    expect(config.CORS_ORIGINS).toBe('http://localhost:5173,https://frontend.example.com');
  });

  it('rejects unsupported node environments', () => {
    expect(() => validate({ ...validBase, NODE_ENV: 'provision' })).toThrow(
      /Environment validation failed/,
    );
    expect(() => validate({ ...validBase, NODE_ENV: 'provision' })).toThrow(
      /"property": "NODE_ENV"/,
    );
  });

  it('rejects invalid ports', () => {
    expect(() => validate({ ...validBase, PORT: '70000' })).toThrow(/Environment validation failed/);
    expect(() => validate({ ...validBase, PORT: '70000' })).toThrow(/"property": "PORT"/);
    expect(() => validate({ ...validBase, PORT: '70000' })).toThrow(
      /must not be greater than 65535/,
    );
  });

  it('rejects non-numeric port strings', () => {
    expect(() => validate({ ...validBase, PORT: '3000abc' })).toThrow(
      /Environment validation failed/,
    );
    expect(() => validate({ ...validBase, PORT: '3000abc' })).toThrow(/"property": "PORT"/);
  });

  it('rejects empty port strings', () => {
    expect(() => validate({ ...validBase, PORT: '' })).toThrow(/Environment validation failed/);
    expect(() => validate({ ...validBase, PORT: '' })).toThrow(/"property": "PORT"/);
  });

  it('rejects missing DATABASE_URL', () => {
    expect(() => validate({})).toThrow(/Environment validation failed/);
    expect(() => validate({})).toThrow(/"property": "DATABASE_URL"/);
  });

  it('rejects DATABASE_URL without protocol', () => {
    expect(() => validate({ ...validBase, DATABASE_URL: 'localhost:5432/lms' })).toThrow(
      /Environment validation failed/,
    );
    expect(() => validate({ ...validBase, DATABASE_URL: 'localhost:5432/lms' })).toThrow(
      /"property": "DATABASE_URL"/,
    );
  });

  it('accepts DATABASE_URL with protocol and host', () => {
    expect(() =>
      validate({ ...validBase, DATABASE_URL: 'postgresql://user:pass@db:5432/lms' }),
    ).not.toThrow();
  });
});
