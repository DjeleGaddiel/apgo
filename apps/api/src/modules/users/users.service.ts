import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { UserStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  AccessDeniedException,
  ResourceNotFoundException,
} from '../../common/errors/common.errors';
import type { AuthenticatedUser } from '../access/authenticated-user';
import { Permission } from '../access/permissions';
import { RoleKey } from '../access/system-roles';
import { AuditService } from '../audit/audit.service';
import { RefreshTokenService } from '../auth/refresh-token.service';
import { ListUsersQueryDto } from './dto/list-users.query.dto';
import { UserDto, UserPageDto } from './dto/user.dto';
import {
  InvalidStatusChangeException,
  SelfActionForbiddenException,
} from './users.errors';

const withRole = {
  role: { include: { permissions: true } },
} satisfies Prisma.UserInclude;
type UserWithRole = Prisma.UserGetPayload<{ include: typeof withRole }>;

/** Changements d'état autorisés : état de départ → action. */
const TRANSITIONS = {
  approve: { from: [UserStatus.PENDING], to: UserStatus.ACTIVE },
  suspend: { from: [UserStatus.ACTIVE], to: UserStatus.SUSPENDED },
  reactivate: { from: [UserStatus.SUSPENDED], to: UserStatus.ACTIVE },
} as const;
type Transition = keyof typeof TRANSITIONS;

export function toUserDto(user: UserWithRole): UserDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    locale: user.locale,
    role: { key: user.role.key, name: user.role.name },
    twoFactorEnabled: user.twoFactorEnabledAt !== null,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly refreshTokens: RefreshTokenService,
  ) {}

  async list(query: ListUsersQueryDto): Promise<UserPageDto> {
    const where: Prisma.UserWhereInput = {
      status: query.status ?? { not: UserStatus.DELETED },
      role: query.role ? { key: query.role } : undefined,
      OR: query.search
        ? [
            { email: { contains: query.search, mode: 'insensitive' } },
            { firstName: { contains: query.search, mode: 'insensitive' } },
            { lastName: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: withRole,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);
    return {
      total,
      page: query.page,
      pageSize: query.pageSize,
      items: users.map(toUserDto),
    };
  }

  async get(id: string): Promise<UserDto> {
    return toUserDto(await this.findTarget(id));
  }

  approve(actor: AuthenticatedUser, id: string, ip?: string) {
    return this.changeStatus(actor, id, 'approve', ip);
  }

  suspend(actor: AuthenticatedUser, id: string, ip?: string) {
    return this.changeStatus(actor, id, 'suspend', ip);
  }

  reactivate(actor: AuthenticatedUser, id: string, ip?: string) {
    return this.changeStatus(actor, id, 'reactivate', ip);
  }

  /**
   * Suppression : les données personnelles sont effacées, la ligne reste pour que
   * le journal d'audit et les certificats délivrés restent cohérents.
   */
  async remove(
    actor: AuthenticatedUser,
    id: string,
    ip?: string,
  ): Promise<void> {
    const target = await this.findTarget(id);
    this.assertCanManage(actor, target);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          status: UserStatus.DELETED,
          email: `supprime-${id}@apgo.invalid`,
          firstName: 'Compte',
          lastName: 'supprimé',
          passwordHash: '!',
          twoFactorSecret: null,
          twoFactorEnabledAt: null,
        },
      });
      await this.refreshTokens.revokeAllForUser(id, tx);
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'user.delete',
          targetType: 'user',
          targetId: id,
          metadata: { previousStatus: target.status, role: target.role.key },
          ip,
        },
        tx,
      );
    });
  }

  private async changeStatus(
    actor: AuthenticatedUser,
    id: string,
    transition: Transition,
    ip?: string,
  ): Promise<UserDto> {
    const target = await this.findTarget(id);
    this.assertCanManage(actor, target);

    const { from, to } = TRANSITIONS[transition];
    if (!(from as readonly UserStatus[]).includes(target.status)) {
      throw new InvalidStatusChangeException();
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { status: to },
        include: withRole,
      });
      if (to !== UserStatus.ACTIVE) {
        await this.refreshTokens.revokeAllForUser(id, tx);
      }
      await this.audit.record(
        {
          actorId: actor.id,
          action: `user.${transition}`,
          targetType: 'user',
          targetId: id,
          metadata: { from: target.status, to, role: target.role.key },
          ip,
        },
        tx,
      );
      return user;
    });
    return toUserDto(updated);
  }

  private async findTarget(id: string): Promise<UserWithRole> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: withRole,
    });
    if (!user || user.status === UserStatus.DELETED) {
      throw new ResourceNotFoundException('Compte introuvable.');
    }
    return user;
  }

  /**
   * Seuls les détenteurs de `admins.manage` agissent sur l'équipe d'administration,
   * et seul un super admin agit sur un autre super admin.
   */
  private assertCanManage(
    actor: AuthenticatedUser,
    target: UserWithRole,
  ): void {
    if (actor.id === target.id) throw new SelfActionForbiddenException();

    const targetIsStaff = target.role.permissions.some(
      (p) => p.permission === Permission.ADMIN_ACCESS,
    );
    if (targetIsStaff && !actor.permissions.has(Permission.ADMINS_MANAGE)) {
      throw new AccessDeniedException();
    }
    if (
      target.role.key === RoleKey.SUPER_ADMIN &&
      actor.roleKey !== RoleKey.SUPER_ADMIN
    ) {
      throw new AccessDeniedException();
    }
  }
}
