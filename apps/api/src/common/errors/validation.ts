import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ErrorDetail } from './api.exception';
import { ValidationFailedException } from './common.errors';

/** `isEmail` → `IS_EMAIL`, `maxLength` → `MAX_LENGTH`. */
const toCode = (constraint: string): string =>
  constraint.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();

/** Aplatit les erreurs de `class-validator`, y compris les objets imbriqués (`address.city`). */
export function toErrorDetails(
  errors: ValidationError[],
  parent = '',
): ErrorDetail[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.keys(error.constraints ?? {}).map((constraint) => ({
      field,
      code:
        constraint === 'whitelistValidation'
          ? 'NOT_ALLOWED'
          : toCode(constraint),
    }));
    return [...own, ...toErrorDetails(error.children ?? [], field)];
  });
}

/** Validation stricte de toutes les données reçues (skill `security`). */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) =>
      new ValidationFailedException(toErrorDetails(errors)),
  });
}
