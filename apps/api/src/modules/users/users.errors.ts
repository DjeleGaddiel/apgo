import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../../common/errors/api.exception';

export const UsersErrorCode = {
  SELF_ACTION_FORBIDDEN: 'USER_SELF_ACTION_FORBIDDEN',
  INVALID_STATUS_CHANGE: 'USER_INVALID_STATUS_CHANGE',
} as const;

export class SelfActionForbiddenException extends ApiException {
  constructor() {
    super(
      HttpStatus.FORBIDDEN,
      UsersErrorCode.SELF_ACTION_FORBIDDEN,
      'Vous ne pouvez pas effectuer cette action sur votre propre compte.',
    );
  }
}

export class InvalidStatusChangeException extends ApiException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      UsersErrorCode.INVALID_STATUS_CHANGE,
      "Cette action n'est pas possible dans l'état actuel du compte.",
    );
  }
}
