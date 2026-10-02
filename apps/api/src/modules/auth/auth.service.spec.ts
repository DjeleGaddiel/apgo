import * as argon2 from 'argon2';
import { Prisma } from '../../generated/prisma/client';
import { UserStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AccessTokenService } from '../access/access-token.service';
import { Permission } from '../access/permissions';
import {
  AccountPendingException,
  AccountSuspendedException,
  ChallengeExpiredException,
  EmailTakenException,
  InvalidCredentialsException,
  InvalidTwoFactorCodeException,
  TooManyAttemptsException,
} from './auth.errors';
import { AuthService, MAX_FAILED_ATTEMPTS } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';
import { TwoFactorService } from './two-factor.service';

describe('AuthService', () => {
  const user = {
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const role = { findUniqueOrThrow: jest.fn() };
  const accessTokens = {
    signAccess: jest.fn().mockResolvedValue('acces'),
    signTwoFactorChallenge: jest.fn().mockResolvedValue('defi'),
    verify: jest.fn(),
  };
  const refreshTokens = {
    issue: jest.fn().mockResolvedValue('renouvellement'),
  };
  const twoFactor = { createSecret: jest.fn(), isValidCode: jest.fn() };

  const service = new AuthService(
    { user, role } as unknown as PrismaService,
    accessTokens as unknown as AccessTokenService,
    refreshTokens as unknown as RefreshTokenService,
    twoFactor as unknown as TwoFactorService,
  );

  let passwordHash: string;
  beforeAll(async () => {
    passwordHash = await argon2.hash('mot-de-passe-solide', {
      type: argon2.argon2id,
    });
  });

  const account = (overrides: Record<string, unknown> = {}) => ({
    id: 'u1',
    email: 'ama@exemple.ci',
    passwordHash,
    firstName: 'Ama',
    lastName: 'Kouassi',
    locale: 'fr',
    status: UserStatus.ACTIVE,
    failedLoginCount: 0,
    lockedUntil: null,
    twoFactorSecret: null,
    twoFactorEnabledAt: null,
    role: {
      key: 'LEARNER',
      name: 'Apprenant',
      requiresTwoFactor: false,
      permissions: [{ permission: Permission.LEARNING }],
    },
    ...overrides,
  });

  const adminRole = {
    key: 'ADMIN',
    name: 'Administrateur APGO',
    requiresTwoFactor: true,
    permissions: [{ permission: Permission.ADMIN_ACCESS }],
  };

  beforeEach(() => {
    user.findUnique.mockReset();
    user.update.mockReset();
    user.create.mockReset();
    twoFactor.isValidCode.mockReset();
    accessTokens.verify.mockReset();
    refreshTokens.issue.mockClear();
  });

  describe('connexion', () => {
    it('ouvre une session avec un mot de passe correct', async () => {
      user.findUnique.mockResolvedValue(account());

      const outcome = await service.login(
        'ama@exemple.ci',
        'mot-de-passe-solide',
        {},
      );

      expect(outcome).toMatchObject({
        status: 'AUTHENTICATED',
        user: { id: 'u1', permissions: [Permission.LEARNING] },
        session: { accessToken: 'acces', refreshToken: 'renouvellement' },
      });
    });

    it('répond de la même façon pour un compte inconnu et un mauvais mot de passe', async () => {
      user.findUnique.mockResolvedValueOnce(null);
      const unknown = await service
        .login('inconnu@exemple.ci', 'x', {})
        .catch((e: unknown) => e);

      user.findUnique.mockResolvedValueOnce(account());
      const wrong = await service
        .login('ama@exemple.ci', 'mauvais', {})
        .catch((e: unknown) => e);

      expect(unknown).toBeInstanceOf(InvalidCredentialsException);
      expect(wrong).toBeInstanceOf(InvalidCredentialsException);
    });

    it(`bloque le compte 15 minutes après ${MAX_FAILED_ATTEMPTS} échecs`, async () => {
      user.findUnique.mockResolvedValue(
        account({ failedLoginCount: MAX_FAILED_ATTEMPTS - 1 }),
      );
      await expect(
        service.login('ama@exemple.ci', 'mauvais', {}),
      ).rejects.toBeInstanceOf(InvalidCredentialsException);

      const data = user.update.mock.calls[0][0].data;
      expect(data.lockedUntil.getTime()).toBeGreaterThan(
        Date.now() + 14 * 60 * 1000,
      );
    });

    it('refuse même le bon mot de passe pendant le blocage', async () => {
      user.findUnique.mockResolvedValue(
        account({ lockedUntil: new Date(Date.now() + 60_000) }),
      );
      await expect(
        service.login('ama@exemple.ci', 'mot-de-passe-solide', {}),
      ).rejects.toBeInstanceOf(TooManyAttemptsException);
    });

    it('refuse un formateur en attente et un compte suspendu', async () => {
      user.findUnique.mockResolvedValueOnce(
        account({ status: UserStatus.PENDING }),
      );
      await expect(
        service.login('ama@exemple.ci', 'mot-de-passe-solide', {}),
      ).rejects.toBeInstanceOf(AccountPendingException);

      user.findUnique.mockResolvedValueOnce(
        account({ status: UserStatus.SUSPENDED }),
      );
      await expect(
        service.login('ama@exemple.ci', 'mot-de-passe-solide', {}),
      ).rejects.toBeInstanceOf(AccountSuspendedException);
    });

    it('n’ouvre pas de session à un admin sans double authentification', async () => {
      user.findUnique.mockResolvedValueOnce(account({ role: adminRole }));
      await expect(
        service.login('ama@exemple.ci', 'mot-de-passe-solide', {}),
      ).resolves.toEqual({
        status: 'TWO_FACTOR_SETUP_REQUIRED',
        challengeToken: 'defi',
      });

      user.findUnique.mockResolvedValueOnce(
        account({ role: adminRole, twoFactorEnabledAt: new Date() }),
      );
      await expect(
        service.login('ama@exemple.ci', 'mot-de-passe-solide', {}),
      ).resolves.toMatchObject({ status: 'TWO_FACTOR_REQUIRED' });
      expect(refreshTokens.issue).not.toHaveBeenCalled();
    });
  });

  describe('double authentification', () => {
    const admin = () =>
      account({
        role: adminRole,
        twoFactorSecret: 'v1:chiffre',
        twoFactorEnabledAt: null,
      });

    it('active la double authentification au premier code valide', async () => {
      accessTokens.verify.mockResolvedValue('u1');
      user.findUnique.mockResolvedValue(admin());
      twoFactor.isValidCode.mockResolvedValue(true);

      const outcome = await service.verifyTwoFactor('defi', '123456', {});

      expect(outcome.status).toBe('AUTHENTICATED');
      expect(user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { twoFactorEnabledAt: expect.any(Date) },
      });
    });

    it('refuse un code faux et le compte comme un échec', async () => {
      accessTokens.verify.mockResolvedValue('u1');
      user.findUnique.mockResolvedValue(admin());
      twoFactor.isValidCode.mockResolvedValue(false);

      await expect(
        service.verifyTwoFactor('defi', '000000', {}),
      ).rejects.toBeInstanceOf(InvalidTwoFactorCodeException);
      expect(user.update.mock.calls[0][0].data.failedLoginCount).toBe(1);
    });

    it('refuse un jeton d’étape expiré', async () => {
      accessTokens.verify.mockResolvedValue(null);
      await expect(
        service.verifyTwoFactor('expire', '123456', {}),
      ).rejects.toBeInstanceOf(ChallengeExpiredException);
    });
  });

  describe('inscription', () => {
    const dto = {
      email: 'kofi@exemple.ci',
      password: 'mot-de-passe-solide',
      firstName: 'Kofi',
      lastName: 'Yao',
    };

    beforeEach(() => role.findUniqueOrThrow.mockResolvedValue({ id: 'r1' }));

    it('hache le mot de passe avec Argon2id', async () => {
      user.create.mockResolvedValue(account());
      await service.registerLearner(dto, {});

      const data = user.create.mock.calls[0][0].data;
      expect(data.passwordHash).toMatch(/^\$argon2id\$/);
      expect(JSON.stringify(data)).not.toContain(dto.password);
    });

    it('crée un formateur en attente, sans ouvrir de session', async () => {
      user.create.mockResolvedValue(account({ status: UserStatus.PENDING }));
      await expect(service.registerTrainer(dto)).resolves.toEqual({
        status: 'PENDING_APPROVAL',
      });
      expect(role.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { key: 'TRAINER' },
      });
      expect(user.create.mock.calls[0][0].data.status).toBe(UserStatus.PENDING);
    });

    it('signale une adresse déjà utilisée', async () => {
      user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('unique', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );
      await expect(service.registerLearner(dto, {})).rejects.toBeInstanceOf(
        EmailTakenException,
      );
    });
  });
});
