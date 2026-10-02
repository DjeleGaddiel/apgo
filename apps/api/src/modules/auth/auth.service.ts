import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma } from '../../generated/prisma/client';
import { UserStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  AccessTokenService,
} from '../access/access-token.service';
import { isPermission } from '../access/permissions';
import { RoleKey } from '../access/system-roles';
import {
  AccountPendingException,
  AccountSuspendedException,
  ChallengeExpiredException,
  EmailTakenException,
  InvalidCredentialsException,
  InvalidTwoFactorCodeException,
  TooManyAttemptsException,
  TwoFactorAlreadyEnabledException,
  TwoFactorNotSetUpException,
} from './auth.errors';
import { CurrentUserDto } from './dto/current-user.dto';
import { RegisterDto } from './dto/register.dto';
import { ClientContext, RefreshTokenService } from './refresh-token.service';
import { TwoFactorService } from './two-factor.service';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_DURATION_MS = 15 * 60 * 1000;

const userWithRole = {
  role: { include: { permissions: true } },
} satisfies Prisma.UserInclude;
type UserWithRole = Prisma.UserGetPayload<{ include: typeof userWithRole }>;

export interface Session {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
}

export type AuthOutcome =
  | { status: 'AUTHENTICATED'; user: CurrentUserDto; session: Session }
  | {
      status: 'TWO_FACTOR_REQUIRED' | 'TWO_FACTOR_SETUP_REQUIRED';
      challengeToken: string;
    }
  | { status: 'PENDING_APPROVAL' };

/** Utilisé quand le compte n'existe pas, pour que la réponse prenne le même temps. */
let dummyHash: Promise<string> | undefined;

export function toCurrentUser(user: UserWithRole): CurrentUserDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    locale: user.locale,
    role: { key: user.role.key, name: user.role.name },
    permissions: user.role.permissions
      .map((p) => p.permission)
      .filter(isPermission),
    twoFactorEnabled: user.twoFactorEnabledAt !== null,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessTokens: AccessTokenService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly twoFactor: TwoFactorService,
  ) {}

  /** Apprenant : compte actif tout de suite, session ouverte. */
  async registerLearner(
    dto: RegisterDto,
    context: ClientContext,
  ): Promise<AuthOutcome> {
    const user = await this.createUser(dto, RoleKey.LEARNER, UserStatus.ACTIVE);
    return this.authenticated(user, context);
  }

  /** Formateur : compte en attente de validation par un admin, pas de session. */
  async registerTrainer(dto: RegisterDto): Promise<AuthOutcome> {
    await this.createUser(dto, RoleKey.TRAINER, UserStatus.PENDING);
    return { status: 'PENDING_APPROVAL' };
  }

  async login(
    email: string,
    password: string,
    context: ClientContext,
  ): Promise<AuthOutcome> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: userWithRole,
    });

    if (!user || user.status === UserStatus.DELETED) {
      await argon2.verify(await getDummyHash(), password).catch(() => false);
      throw new InvalidCredentialsException();
    }
    this.assertNotLocked(user);

    if (!(await argon2.verify(user.passwordHash, password))) {
      await this.recordFailure(user);
      throw new InvalidCredentialsException();
    }
    this.assertCanSignIn(user);

    if (user.role.requiresTwoFactor) {
      await this.resetFailures(user.id);
      return {
        status: user.twoFactorEnabledAt
          ? 'TWO_FACTOR_REQUIRED'
          : 'TWO_FACTOR_SETUP_REQUIRED',
        challengeToken: await this.accessTokens.signTwoFactorChallenge(user.id),
      };
    }
    return this.authenticated(user, context);
  }

  /** Première configuration : le secret est enregistré mais activé seulement après un code valide. */
  async setUpTwoFactor(
    challengeToken: string,
  ): Promise<{ secret: string; otpauthUri: string }> {
    const user = await this.userFromChallenge(challengeToken);
    if (user.twoFactorEnabledAt) throw new TwoFactorAlreadyEnabledException();

    const { secret, otpauthUri, sealed } = this.twoFactor.createSecret(
      user.email,
    );
    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: sealed },
    });
    return { secret, otpauthUri };
  }

  async verifyTwoFactor(
    challengeToken: string,
    code: string,
    context: ClientContext,
  ): Promise<AuthOutcome> {
    const user = await this.userFromChallenge(challengeToken);
    if (!user.twoFactorSecret) throw new TwoFactorNotSetUpException();
    this.assertNotLocked(user);

    if (!(await this.twoFactor.isValidCode(user.twoFactorSecret, code))) {
      await this.recordFailure(user);
      throw new InvalidTwoFactorCodeException();
    }
    if (!user.twoFactorEnabledAt) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabledAt: new Date() },
      });
      user.twoFactorEnabledAt = new Date();
    }
    return this.authenticated(user, context);
  }

  async refresh(token: string, context: ClientContext): Promise<AuthOutcome> {
    const { userId, refreshToken } = await this.refreshTokens.rotate(
      token,
      context,
    );
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: userWithRole,
    });
    return {
      status: 'AUTHENTICATED',
      user: toCurrentUser(user),
      session: await this.sessionWith(user.id, refreshToken),
    };
  }

  logout(refreshToken: string | undefined): Promise<void> {
    return refreshToken
      ? this.refreshTokens.revoke(refreshToken)
      : Promise.resolve();
  }

  async me(userId: string): Promise<CurrentUserDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: userWithRole,
    });
    return toCurrentUser(user);
  }

  private async createUser(
    dto: RegisterDto,
    roleKey: RoleKey,
    status: UserStatus,
  ): Promise<UserWithRole> {
    const role = await this.prisma.role.findUniqueOrThrow({
      where: { key: roleKey },
    });
    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: await argon2.hash(dto.password, {
            type: argon2.argon2id,
          }),
          firstName: dto.firstName,
          lastName: dto.lastName,
          locale: dto.locale ?? 'fr',
          status,
          roleId: role.id,
        },
        include: userWithRole,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EmailTakenException();
      }
      throw error;
    }
  }

  private async authenticated(
    user: UserWithRole,
    context: ClientContext,
  ): Promise<AuthOutcome> {
    const refreshToken = await this.refreshTokens.issue(user.id, context);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
    return {
      status: 'AUTHENTICATED',
      user: toCurrentUser(user),
      session: await this.sessionWith(user.id, refreshToken),
    };
  }

  private async sessionWith(
    userId: string,
    refreshToken: string,
  ): Promise<Session> {
    return {
      accessToken: await this.accessTokens.signAccess(userId),
      refreshToken,
      accessTokenExpiresAt: new Date(
        Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000,
      ),
    };
  }

  private async userFromChallenge(token: string): Promise<UserWithRole> {
    const userId = await this.accessTokens.verify(token, 'two-factor');
    if (!userId) throw new ChallengeExpiredException();
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: userWithRole,
    });
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new ChallengeExpiredException();
    }
    return user;
  }

  private assertNotLocked(user: UserWithRole): void {
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new TooManyAttemptsException();
    }
  }

  private assertCanSignIn(user: UserWithRole): void {
    if (user.status === UserStatus.PENDING) throw new AccountPendingException();
    if (user.status === UserStatus.SUSPENDED) {
      throw new AccountSuspendedException();
    }
  }

  /** Après `MAX_FAILED_ATTEMPTS` échecs, le compte est bloqué 15 minutes. */
  private async recordFailure(user: UserWithRole): Promise<void> {
    const failures = user.failedLoginCount + 1;
    const locked = failures >= MAX_FAILED_ATTEMPTS;
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: locked ? 0 : failures,
        lockedUntil: locked ? new Date(Date.now() + LOCK_DURATION_MS) : null,
      },
    });
  }

  private async resetFailures(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginCount: 0, lockedUntil: null },
    });
  }
}

function getDummyHash(): Promise<string> {
  dummyHash ??= argon2.hash('apgo-compte-inexistant', {
    type: argon2.argon2id,
  });
  return dummyHash;
}
