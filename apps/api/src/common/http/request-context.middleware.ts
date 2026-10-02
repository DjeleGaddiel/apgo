import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

const VALID_REQUEST_ID = /^[\w-]{8,64}$/;

/**
 * Donne un identifiant à chaque requête (repris de `X-Request-Id` s'il est valide) et
 * journalise route, statut, durée et utilisateur, sans donnée personnelle.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Http');

  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.header('x-request-id');
    req.id =
      incoming && VALID_REQUEST_ID.test(incoming) ? incoming : randomUUID();
    res.setHeader('X-Request-Id', req.id);

    const start = process.hrtime.bigint();
    res.on('finish', () => {
      this.logger.log({
        requestId: req.id,
        method: req.method,
        route: req.route?.path ?? req.path,
        status: res.statusCode,
        durationMs: Number(process.hrtime.bigint() - start) / 1e6,
        userId: req.user?.id,
      });
    });
    next();
  }
}
