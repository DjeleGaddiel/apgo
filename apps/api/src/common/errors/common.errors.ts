import { HttpStatus } from '@nestjs/common';
import { ApiException, ErrorDetail } from './api.exception';

/** Codes d'erreur communs à toute l'API. Les codes propres à un domaine sont dans son module. */
export const CommonErrorCode = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  BAD_REQUEST: 'BAD_REQUEST',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export class ValidationFailedException extends ApiException {
  constructor(details: ErrorDetail[]) {
    super(
      HttpStatus.BAD_REQUEST,
      CommonErrorCode.VALIDATION_FAILED,
      'Certaines informations sont invalides.',
      details,
    );
  }
}

export class AuthRequiredException extends ApiException {
  constructor() {
    super(
      HttpStatus.UNAUTHORIZED,
      CommonErrorCode.AUTH_REQUIRED,
      'Veuillez vous connecter pour continuer.',
    );
  }
}

export class AccessDeniedException extends ApiException {
  constructor() {
    super(
      HttpStatus.FORBIDDEN,
      CommonErrorCode.ACCESS_DENIED,
      "Vous n'avez pas l'autorisation d'effectuer cette action.",
    );
  }
}

export class ResourceNotFoundException extends ApiException {
  constructor(message = 'Ressource introuvable.') {
    super(HttpStatus.NOT_FOUND, CommonErrorCode.NOT_FOUND, message);
  }
}
