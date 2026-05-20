import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsActivityDeadline(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isActivityDeadline',
      target: object.constructor,
      propertyName,
      options: {
        message: 'deadline must be a valid date in YYYY-MM-DD format',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
          const [year, month, day] = value.split('-').map(Number);
          const d = new Date(Date.UTC(year, month - 1, day));
          return (
            d.getUTCFullYear() === year &&
            d.getUTCMonth() === month - 1 &&
            d.getUTCDate() === day
          );
        },
      },
    });
  };
}
