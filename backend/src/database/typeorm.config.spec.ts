import { createDataSourceOptions, createTypeOrmOptions } from './typeorm.config';

describe('typeorm.config', () => {
  it('disables synchronize and enables automatic migrations', () => {
    const options = createTypeOrmOptions('postgresql://user:pass@localhost:5432/lms');

    expect(options.synchronize).toBe(false);
    expect(options.migrationsRun).toBe(true);
    expect(options.entities).toHaveLength(7);
    expect(options.migrations).toEqual(
      expect.arrayContaining([expect.stringContaining('/migrations/*{.ts,.js}')]),
    );
  });

  it('creates CLI-compatible data source options', () => {
    const options = createDataSourceOptions('postgresql://user:pass@localhost:5432/lms');

    expect(options.type).toBe('postgres');
    expect(options.url).toBe('postgresql://user:pass@localhost:5432/lms');
    expect(options.synchronize).toBe(false);
    expect(options.migrationsRun).toBe(true);
  });
});
