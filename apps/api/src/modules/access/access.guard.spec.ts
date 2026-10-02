import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  AccessDeniedException,
  AuthRequiredException,
} from '../../common/errors/common.errors';
import { AccessRule } from './access.decorators';
import { AccessGuard } from './access.guard';
import { AccessTokenService } from './access-token.service';
import { Permission } from './permissions';

describe('AccessGuard', () => {
  const findUnique = jest.fn();
  const verify = jest.fn();
  let rule: AccessRule | undefined;

  const guard = new AccessGuard(
    { getAllAndOverride: () => rule } as unknown as Reflector,
    { verify } as unknown as AccessTokenService,
    { user: { findUnique } } as unknown as PrismaService,
  );

  const contextFor = (headers: Record<string, string> = {}) => {
    const request = {
      method: 'GET',
      path: '/api/test',
      cookies: {},
      header: (name: string) => headers[name.toLowerCase()],
    } as Record<string, unknown>;
    const context = {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { context, request };
  };

  const activeSupport = {
    id: 'u1',
    email: 'support@apgo.ci',
    status: UserStatus.ACTIVE,
    role: {
      key: 'SUPPORT',
      permissions: [{ permission: Permission.USERS_READ }],
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    rule = undefined;
  });

  it('refuse une route qui ne déclare aucune règle', async () => {
    await expect(
      guard.canActivate(contextFor().context),
    ).rejects.toBeInstanceOf(AccessDeniedException);
  });

  it('laisse passer une route publique sans compte', async () => {
    rule = { kind: 'public' };
    await expect(guard.canActivate(contextFor().context)).resolves.toBe(true);
  });

  it('exige une connexion pour une route protégée', async () => {
    rule = { kind: 'authenticated' };
    await expect(
      guard.canActivate(contextFor().context),
    ).rejects.toBeInstanceOf(AuthRequiredException);
  });

  it('accepte un utilisateur qui a la permission demandée', async () => {
    rule = { kind: 'permissions', permissions: [Permission.USERS_READ] };
    verify.mockResolvedValue('u1');
    findUnique.mockResolvedValue(activeSupport);
    const { context, request } = contextFor({ authorization: 'Bearer jeton' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request['user']).toMatchObject({ id: 'u1', roleKey: 'SUPPORT' });
  });

  it('refuse le service client sur une action réservée aux admins', async () => {
    rule = { kind: 'permissions', permissions: [Permission.USERS_MANAGE] };
    verify.mockResolvedValue('u1');
    findUnique.mockResolvedValue(activeSupport);

    await expect(
      guard.canActivate(contextFor({ authorization: 'Bearer jeton' }).context),
    ).rejects.toBeInstanceOf(AccessDeniedException);
  });

  it('traite un compte suspendu comme non connecté', async () => {
    rule = { kind: 'authenticated' };
    verify.mockResolvedValue('u1');
    findUnique.mockResolvedValue({
      ...activeSupport,
      status: UserStatus.SUSPENDED,
    });

    await expect(
      guard.canActivate(contextFor({ authorization: 'Bearer jeton' }).context),
    ).rejects.toBeInstanceOf(AuthRequiredException);
  });
});
