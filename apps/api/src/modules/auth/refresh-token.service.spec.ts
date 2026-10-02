import { createHash } from 'node:crypto';
import { UserStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { SessionExpiredException } from './auth.errors';
import { RefreshTokenService } from './refresh-token.service';

describe('RefreshTokenService', () => {
  const refreshToken = {
    create: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  };
  const prisma = {
    refreshToken,
    $transaction: (fn: (tx: unknown) => unknown) => fn({ refreshToken }),
  } as unknown as PrismaService;
  const service = new RefreshTokenService(prisma);

  const stored = (overrides: Record<string, unknown> = {}) => ({
    id: 't1',
    userId: 'u1',
    familyId: 'f1',
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    usedAt: null,
    user: { status: UserStatus.ACTIVE },
    ...overrides,
  });

  beforeEach(() => jest.resetAllMocks());

  it('ne stocke que l’empreinte du jeton', async () => {
    const token = await service.issue('u1', { ip: '203.0.113.1' });
    const data = refreshToken.create.mock.calls[0][0].data;
    expect(data.tokenHash).toBe(
      createHash('sha256').update(token).digest('hex'),
    );
    expect(JSON.stringify(data)).not.toContain(token);
  });

  it('remplace un jeton valide par un nouveau de la même famille', async () => {
    refreshToken.findUnique.mockResolvedValue(stored());
    refreshToken.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.rotate('ancien', {});

    expect(result.userId).toBe('u1');
    expect(result.refreshToken).not.toBe('ancien');
    expect(refreshToken.create.mock.calls[0][0].data.familyId).toBe('f1');
  });

  it('révoque toute la famille quand un jeton déjà utilisé revient', async () => {
    refreshToken.findUnique.mockResolvedValue(stored({ usedAt: new Date() }));

    await expect(service.rotate('vole', {})).rejects.toBeInstanceOf(
      SessionExpiredException,
    );
    expect(refreshToken.updateMany).toHaveBeenCalledWith({
      where: { familyId: 'f1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    expect(refreshToken.create).not.toHaveBeenCalled();
  });

  it('refuse un jeton expiré ou un compte suspendu', async () => {
    refreshToken.findUnique.mockResolvedValueOnce(
      stored({ expiresAt: new Date(Date.now() - 1) }),
    );
    await expect(service.rotate('x', {})).rejects.toBeInstanceOf(
      SessionExpiredException,
    );

    refreshToken.findUnique.mockResolvedValueOnce(
      stored({ user: { status: UserStatus.SUSPENDED } }),
    );
    await expect(service.rotate('x', {})).rejects.toBeInstanceOf(
      SessionExpiredException,
    );
  });

  it('ne laisse réussir qu’un seul de deux renouvellements simultanés', async () => {
    refreshToken.findUnique.mockResolvedValue(stored());
    refreshToken.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.rotate('double', {})).rejects.toBeInstanceOf(
      SessionExpiredException,
    );
    expect(refreshToken.create).not.toHaveBeenCalled();
  });
});
