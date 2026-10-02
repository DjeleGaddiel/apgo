import { UserStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  AccessDeniedException,
  ResourceNotFoundException,
} from '../../common/errors/common.errors';
import type { AuthenticatedUser } from '../access/authenticated-user';
import { Permission } from '../access/permissions';
import { SYSTEM_ROLES } from '../access/system-roles';
import { AuditService } from '../audit/audit.service';
import { RefreshTokenService } from '../auth/refresh-token.service';
import {
  InvalidStatusChangeException,
  SelfActionForbiddenException,
} from './users.errors';
import { UsersService } from './users.service';

const roleOf = (key: string) => {
  const role = SYSTEM_ROLES.find((r) => r.key === key);
  if (!role) throw new Error(key);
  return {
    key: role.key,
    name: role.name,
    permissions: role.permissions.map((permission) => ({ permission })),
  };
};

const actorWith = (key: string, id = 'actor'): AuthenticatedUser => {
  const role = SYSTEM_ROLES.find((r) => r.key === key);
  return {
    id,
    email: `${key.toLowerCase()}@apgo.ci`,
    roleKey: key,
    permissions: new Set(role?.permissions),
  };
};

const account = (roleKey: string, status: UserStatus, id = 'target') => ({
  id,
  email: 'compte@exemple.ci',
  firstName: 'Kofi',
  lastName: 'Yao',
  status,
  locale: 'fr',
  role: roleOf(roleKey),
  twoFactorEnabledAt: null,
  lastLoginAt: null,
  createdAt: new Date('2026-10-01T10:00:00Z'),
});

describe('UsersService', () => {
  const user = { findUnique: jest.fn(), update: jest.fn() };
  const tx = { user };
  const prisma = {
    user,
    $transaction: (fn: (t: unknown) => unknown) => fn(tx),
  } as unknown as PrismaService;
  const audit = { record: jest.fn() };
  const refreshTokens = { revokeAllForUser: jest.fn() };
  const service = new UsersService(
    prisma,
    audit as unknown as AuditService,
    refreshTokens as unknown as RefreshTokenService,
  );

  beforeEach(() => jest.resetAllMocks());

  it('valide un formateur en attente et journalise l’action', async () => {
    user.findUnique.mockResolvedValue(account('TRAINER', UserStatus.PENDING));
    user.update.mockResolvedValue(account('TRAINER', UserStatus.ACTIVE));

    const result = await service.approve(
      actorWith('ADMIN'),
      'target',
      '203.0.113.5',
    );

    expect(result.status).toBe(UserStatus.ACTIVE);
    expect(audit.record).toHaveBeenCalledWith(
      {
        actorId: 'actor',
        action: 'user.approve',
        targetType: 'user',
        targetId: 'target',
        metadata: { from: 'PENDING', to: 'ACTIVE', role: 'TRAINER' },
        ip: '203.0.113.5',
      },
      tx,
    );
  });

  it('ferme les sessions d’un compte suspendu', async () => {
    user.findUnique.mockResolvedValue(account('TRAINER', UserStatus.ACTIVE));
    user.update.mockResolvedValue(account('TRAINER', UserStatus.SUSPENDED));

    await service.suspend(actorWith('ADMIN'), 'target');

    expect(refreshTokens.revokeAllForUser).toHaveBeenCalledWith('target', tx);
  });

  it('refuse un changement d’état impossible', async () => {
    user.findUnique.mockResolvedValue(account('TRAINER', UserStatus.ACTIVE));
    await expect(
      service.approve(actorWith('ADMIN'), 'target'),
    ).rejects.toBeInstanceOf(InvalidStatusChangeException);
    expect(audit.record).not.toHaveBeenCalled();
  });

  it('interdit d’agir sur son propre compte', async () => {
    user.findUnique.mockResolvedValue(
      account('ADMIN', UserStatus.ACTIVE, 'actor'),
    );
    await expect(
      service.suspend(actorWith('ADMIN'), 'actor'),
    ).rejects.toBeInstanceOf(SelfActionForbiddenException);
  });

  it('réserve la gestion de l’équipe d’administration à `admins.manage`', async () => {
    const withoutAdminsManage: AuthenticatedUser = {
      ...actorWith('ADMIN'),
      permissions: new Set([Permission.USERS_MANAGE]),
    };
    user.findUnique.mockResolvedValue(account('SUPPORT', UserStatus.ACTIVE));

    await expect(
      service.suspend(withoutAdminsManage, 'target'),
    ).rejects.toBeInstanceOf(AccessDeniedException);
  });

  it('protège le super admin contre un admin APGO', async () => {
    user.findUnique.mockResolvedValue(
      account('SUPER_ADMIN', UserStatus.ACTIVE),
    );
    await expect(
      service.suspend(actorWith('ADMIN'), 'target'),
    ).rejects.toBeInstanceOf(AccessDeniedException);
  });

  it('efface les données personnelles à la suppression', async () => {
    user.findUnique.mockResolvedValue(account('LEARNER', UserStatus.ACTIVE));

    await service.remove(actorWith('ADMIN'), 'target');

    const data = user.update.mock.calls[0][0].data;
    expect(data).toMatchObject({
      status: UserStatus.DELETED,
      email: 'supprime-target@apgo.invalid',
      passwordHash: '!',
      twoFactorSecret: null,
    });
    expect(refreshTokens.revokeAllForUser).toHaveBeenCalledWith('target', tx);
    expect(audit.record.mock.calls[0][0].action).toBe('user.delete');
  });

  it('considère un compte supprimé comme introuvable', async () => {
    user.findUnique.mockResolvedValue(account('LEARNER', UserStatus.DELETED));
    await expect(service.get('target')).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    );
  });
});
