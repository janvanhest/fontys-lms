import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Marks a property as an activity deadline that must be a valid date in YYYY-MM-DD format. It adds custom validation logic on top of the standard class-validator decorators.
 *
 * This decorator is intended for use on DTO fields where a strict, calendar-valid deadline string is required.
 *
 * Args:
 *   validationOptions: Optional configuration to customize validation behavior and error messaging.
 *
 * Returns:
 *   A property decorator function that registers the deadline validation rule on the target field.
 */
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
            d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day
          );
        },
      },
    });
  };
}
