import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../../common/errors/api.exception';

export const AuthErrorCode = {
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  TOO_MANY_ATTEMPTS: 'AUTH_TOO_MANY_ATTEMPTS',
  ACCOUNT_PENDING: 'AUTH_ACCOUNT_PENDING',
  ACCOUNT_SUSPENDED: 'AUTH_ACCOUNT_SUSPENDED',
  EMAIL_TAKEN: 'AUTH_EMAIL_TAKEN',
  SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  CHALLENGE_EXPIRED: 'AUTH_CHALLENGE_EXPIRED',
  INVALID_TWO_FACTOR_CODE: 'AUTH_INVALID_TWO_FACTOR_CODE',
  TWO_FACTOR_ALREADY_ENABLED: 'AUTH_TWO_FACTOR_ALREADY_ENABLED',
  TWO_FACTOR_NOT_SET_UP: 'AUTH_TWO_FACTOR_NOT_SET_UP',
} as const;

/** Message neutre : ne dit jamais si le compte existe. */
export class InvalidCredentialsException extends ApiException {
  constructor() {
    super(
      HttpStatus.UNAUTHORIZED,
      AuthErrorCode.INVALID_CREDENTIALS,
      'Identifiants incorrects.',
    );
  }
}

export class TooManyAttemptsException extends ApiException {
  constructor() {
    super(
      HttpStatus.TOO_MANY_REQUESTS,
      AuthErrorCode.TOO_MANY_ATTEMPTS,
      'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    );
  }
}

export class AccountPendingException extends ApiException {
  constructor() {
    super(
      HttpStatus.FORBIDDEN,
      AuthErrorCode.ACCOUNT_PENDING,
      "Votre compte formateur est en attente de validation par l'équipe APGO.",
    );
  }
}

export class AccountSuspendedException extends ApiException {
  constructor() {
    super(
      HttpStatus.FORBIDDEN,
      AuthErrorCode.ACCOUNT_SUSPENDED,
      'Votre compte est suspendu. Contactez le service client.',
    );
  }
}

export class EmailTakenException extends ApiException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      AuthErrorCode.EMAIL_TAKEN,
      'Un compte existe déjà avec cette adresse email.',
      [{ field: 'email', code: 'TAKEN' }],
    );
  }
}

export class SessionExpiredException extends ApiException {
  constructor() {
    super(
      HttpStatus.UNAUTHORIZED,
      AuthErrorCode.SESSION_EXPIRED,
      'Votre session a expiré. Veuillez vous reconnecter.',
    );
  }
}

export class ChallengeExpiredException extends ApiException {
  constructor() {
    super(
      HttpStatus.UNAUTHORIZED,
      AuthErrorCode.CHALLENGE_EXPIRED,
      'La vérification a expiré. Veuillez vous reconnecter.',
    );
  }
}

export class InvalidTwoFactorCodeException extends ApiException {
  constructor() {
    super(
      HttpStatus.UNAUTHORIZED,
      AuthErrorCode.INVALID_TWO_FACTOR_CODE,
      'Code de vérification incorrect.',
      [{ field: 'code', code: 'INVALID' }],
    );
  }
}

export class TwoFactorAlreadyEnabledException extends ApiException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      AuthErrorCode.TWO_FACTOR_ALREADY_ENABLED,
      'La double authentification est déjà configurée.',
    );
  }
}

export class TwoFactorNotSetUpException extends ApiException {
  constructor() {
    super(
      HttpStatus.UNPROCESSABLE_ENTITY,
      AuthErrorCode.TWO_FACTOR_NOT_SET_UP,
      "Configurez d'abord la double authentification.",
    );
  }
}
