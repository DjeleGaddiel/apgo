import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiException, ErrorDetail } from './api.exception';
import { CommonErrorCode } from './common.errors';

export interface ErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details: ErrorDetail[];
  requestId: string;
}

/** Erreurs levées par Nest ou une bibliothèque, ramenées au format unique. */
const fallbacks: Record<number, { code: string; message: string }> = {
  400: {
    code: CommonErrorCode.BAD_REQUEST,
    message: 'La requête est invalide.',
  },
  401: {
    code: CommonErrorCode.AUTH_REQUIRED,
    message: 'Veuillez vous connecter pour continuer.',
  },
  403: {
    code: CommonErrorCode.ACCESS_DENIED,
    message: "Vous n'avez pas l'autorisation d'effectuer cette action.",
  },
  404: { code: CommonErrorCode.NOT_FOUND, message: 'Ressource introuvable.' },
  409: {
    code: CommonErrorCode.CONFLICT,
    message: 'Cette action entre en conflit avec des données existantes.',
  },
  413: {
    code: CommonErrorCode.PAYLOAD_TOO_LARGE,
    message: 'Les données envoyées sont trop volumineuses.',
  },
  429: {
    code: CommonErrorCode.TOO_MANY_REQUESTS,
    message: 'Trop de requêtes. Patientez un instant puis réessayez.',
  },
  503: {
    code: CommonErrorCode.SERVICE_UNAVAILABLE,
    message: 'Service momentanément indisponible. Réessayez plus tard.',
  },
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const body = this.toBody(exception, request.id ?? '');

    if (body.statusCode >= 500) {
      // Trace complète dans les journaux seulement, jamais dans la réponse.
      this.logger.error(
        {
          requestId: body.requestId,
          method: request.method,
          path: request.path,
          code: body.code,
        },
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(body.statusCode).json(body);
  }

  toBody(exception: unknown, requestId: string): ErrorBody {
    if (exception instanceof ApiException) {
      return {
        statusCode: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details,
        requestId,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const fallback = fallbacks[status] ?? {
        code: status >= 500 ? CommonErrorCode.INTERNAL_ERROR : 'HTTP_ERROR',
        message: 'La requête n’a pas pu aboutir.',
      };
      return { statusCode: status, ...fallback, details: [], requestId };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: CommonErrorCode.INTERNAL_ERROR,
      message: 'Une erreur inattendue est survenue. Réessayez plus tard.',
      details: [],
      requestId,
    };
  }
}
