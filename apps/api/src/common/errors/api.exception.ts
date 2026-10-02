import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorDetail {
  field: string;
  code: string;
}

/**
 * Erreur métier au format unique de l'API (skill `error-handling`) :
 * `code` stable en anglais pour les clients, `message` français de secours.
 */
export class ApiException extends HttpException {
  constructor(
    status: HttpStatus,
    readonly code: string,
    message: string,
    readonly details: ErrorDetail[] = [],
  ) {
    super(message, status);
  }
}
