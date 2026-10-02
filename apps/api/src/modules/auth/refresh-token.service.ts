import { Injectable } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Prisma } from '../../generated/prisma/client';
import { UserStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { SessionExpiredException } from './auth.errors';

export const REFRESH_TOKEN_TTL_DAYS = 30;

export interface ClientContext {
  ip?: string;
  userAgent?: string;
}

const hash = (token: string) =>
  createHash('sha256').update(token).digest('hex');

/**
 * Jetons de renouvellement opaques, stockés hachés et renouvelés à chaque usage.
 * Un jeton déjà utilisé ou révoqué qui revient est le signe d'un vol : toute la famille est révoquée.
 */
@Injectable()
export class RefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async issue(
    userId: string,
    context: ClientContext,
    familyId: string = randomUUID(),
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    await db.refreshToken.create({
      data: {
        userId,
        familyId,
        tokenHash: hash(token),
        expiresAt: new Date(
          Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
        ),
        ip: context.ip,
        userAgent: context.userAgent?.slice(0, 300),
      },
    });
    return token;
  }

  /** Échange un jeton valide contre un nouveau ; renvoie l'utilisateur concerné. */
  async rotate(
    token: string,
    context: ClientContext,
  ): Promise<{ userId: string; refreshToken: string }> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hash(token) },
      include: { user: { select: { status: true } } },
    });
    if (!stored) throw new SessionExpiredException();

    if (stored.revokedAt || stored.usedAt) {
      await this.revokeFamily(stored.familyId);
      throw new SessionExpiredException();
    }
    if (
      stored.expiresAt.getTime() <= Date.now() ||
      stored.user.status !== UserStatus.ACTIVE
    ) {
      throw new SessionExpiredException();
    }

    const rotated = await this.prisma.$transaction(async (tx) => {
      // Condition sur `usedAt` : deux renouvellements simultanés ne peuvent pas réussir tous les deux.
      const { count } = await tx.refreshToken.updateMany({
        where: { id: stored.id, usedAt: null, revokedAt: null },
        data: { usedAt: new Date() },
      });
      if (count === 0) return null;
      return this.issue(stored.userId, context, stored.familyId, tx);
    });

    if (!rotated) {
      await this.revokeFamily(stored.familyId);
      throw new SessionExpiredException();
    }
    return { userId: stored.userId, refreshToken: rotated };
  }

  async revoke(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hash(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Ferme toutes les sessions d'un utilisateur (suspension, suppression). */
  async revokeAllForUser(
    userId: string,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    await db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
