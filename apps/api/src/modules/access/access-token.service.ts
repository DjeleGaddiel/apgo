import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const CHALLENGE_TOKEN_TTL_SECONDS = 5 * 60;

type TokenPurpose = 'access' | 'two-factor';

interface TokenPayload {
  sub: string;
  purpose: TokenPurpose;
}

/** Jetons signés de courte durée : accès (15 min) et étape de double authentification (5 min). */
@Injectable()
export class AccessTokenService {
  constructor(private readonly jwt: JwtService) {}

  signAccess(userId: string): Promise<string> {
    return this.sign(userId, 'access', ACCESS_TOKEN_TTL_SECONDS);
  }

  signTwoFactorChallenge(userId: string): Promise<string> {
    return this.sign(userId, 'two-factor', CHALLENGE_TOKEN_TTL_SECONDS);
  }

  /** Identifiant de l'utilisateur, ou `null` si le jeton est invalide, expiré ou d'un autre usage. */
  async verify(token: string, purpose: TokenPurpose): Promise<string | null> {
    try {
      const payload = await this.jwt.verifyAsync<TokenPayload>(token, {
        algorithms: ['HS256'],
      });
      return payload.purpose === purpose && typeof payload.sub === 'string'
        ? payload.sub
        : null;
    } catch {
      // Jeton invalide ou expiré : traité comme une absence de jeton.
      return null;
    }
  }

  private sign(
    userId: string,
    purpose: TokenPurpose,
    expiresIn: number,
  ): Promise<string> {
    return this.jwt.signAsync({ sub: userId, purpose } satisfies TokenPayload, {
      expiresIn,
      algorithm: 'HS256',
    });
  }
}
