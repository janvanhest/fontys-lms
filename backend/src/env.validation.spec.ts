import { validate } from './env.validation';

describe('validate', () => {
  it('applies defaults for runtime config', () => {
    const config = validate({});

    expect(config.NODE_ENV).toBe('development');
    expect(config.PORT).toBe(3000);
    expect(config.CORS_ORIGINS).toBe('http://localhost:5173');
  });

  it('accepts explicit env values', () => {
    const config = validate({
      NODE_ENV: 'test',
      PORT: '4000',
      CORS_ORIGINS: 'http://localhost:5173,https://frontend.example.com',
    });

    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(4000);
    expect(config.CORS_ORIGINS).toBe('http://localhost:5173,https://frontend.example.com');
  });

  it('rejects invalid ports', () => {
    expect(() => validate({ PORT: '70000' })).toThrow(/Environment validation failed/);
    expect(() => validate({ PORT: '70000' })).toThrow(/"property": "PORT"/);
    expect(() => validate({ PORT: '70000' })).toThrow(/must not be greater than 65535/);
  });
});
