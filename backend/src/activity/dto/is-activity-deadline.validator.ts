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
          const d = new Date(value + 'T00:00:00Z');
          return !isNaN(d.getTime());
        },
      },
    });
  };
}
