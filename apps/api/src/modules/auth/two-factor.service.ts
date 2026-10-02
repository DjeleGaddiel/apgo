import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateSecret, generateURI, verify } from 'otplib';
import type { Env } from '../../config/env';
import { SecretBox } from './secret-box';

const ISSUER = 'APGO';

/** Double authentification par application (TOTP, compatible Google Authenticator, Aegis…). */
@Injectable()
export class TwoFactorService {
  private readonly box: SecretBox;

  constructor(config: ConfigService<Env, true>) {
    this.box = new SecretBox(
      config.get('TWO_FACTOR_ENCRYPTION_KEY', { infer: true }),
    );
  }

  /** Nouveau secret : la valeur en clair est montrée une seule fois, la version chiffrée est stockée. */
  createSecret(email: string): {
    secret: string;
    otpauthUri: string;
    sealed: string;
  } {
    const secret = generateSecret();
    return {
      secret,
      otpauthUri: generateURI({ issuer: ISSUER, label: email, secret }),
      sealed: this.box.encrypt(secret),
    };
  }

  /** Accepte le code de la période en cours et de la précédente (décalage d'horloge du téléphone). */
  async isValidCode(sealedSecret: string, code: string): Promise<boolean> {
    const result = await verify({
      secret: this.box.decrypt(sealedSecret),
      token: code,
      epochTolerance: [30, 0],
    });
    return result.valid;
  }
}
