import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { UserStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  AccessDeniedException,
  AuthRequiredException,
} from '../../common/errors/common.errors';
import { ACCESS_RULE, AccessRule } from './access.decorators';
import { AccessTokenService } from './access-token.service';
import { AuthenticatedUser } from './authenticated-user';
import { ACCESS_COOKIE } from './session-cookies';
import { isPermission } from './permissions';

/**
 * Garde globale : identifie l'utilisateur (cookie ou en-tête `Authorization`), puis applique
 * la règle déclarée par la route. Une route sans règle est refusée (refus par défaut).
 */
@Injectable()
export class AccessGuard implements CanActivate {
  private readonly logger = new Logger(AccessGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: AccessTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const rule = this.reflector.getAllAndOverride<AccessRule | undefined>(
      ACCESS_RULE,
      [context.getHandler(), context.getClass()],
    );

    request.user = (await this.authenticate(request)) ?? undefined;

    if (!rule) {
      this.logger.warn(
        `Route sans règle d'accès refusée : ${request.method} ${request.path}`,
      );
      throw new AccessDeniedException();
    }
    if (rule.kind === 'public') {
      return true;
    }
    if (!request.user) {
      throw new AuthRequiredException();
    }
    if (rule.kind === 'permissions') {
      const user = request.user;
      if (!rule.permissions.every((p) => user.permissions.has(p))) {
        throw new AccessDeniedException();
      }
    }
    return true;
  }

  private async authenticate(
    request: Request,
  ): Promise<AuthenticatedUser | null> {
    const token = this.extractToken(request);
    if (!token) return null;

    const userId = await this.tokens.verify(token, 'access');
    if (!userId) return null;

    // Statut et permissions relus à chaque requête : une suspension prend effet immédiatement.
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        status: true,
        role: { select: { key: true, permissions: true } },
      },
    });
    if (!user || user.status !== UserStatus.ACTIVE) return null;

    return {
      id: user.id,
      email: user.email,
      roleKey: user.role.key,
      permissions: new Set(
        user.role.permissions.map((p) => p.permission).filter(isPermission),
      ),
    };
  }

  private extractToken(request: Request): string | null {
    const header = request.header('authorization');
    if (header?.startsWith('Bearer ')) {
      return header.slice('Bearer '.length).trim() || null;
    }
    const cookie = (request.cookies as Record<string, string> | undefined)?.[
      ACCESS_COOKIE
    ];
    return cookie || null;
  }
}
