import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const VERSION = 'v1';

/** Chiffrement AES-256-GCM des secrets stockés en base (secret de double authentification). */
export class SecretBox {
  private readonly key: Buffer;

  constructor(base64Key: string) {
    this.key = Buffer.from(base64Key, 'base64');
    if (this.key.length !== 32) {
      throw new Error('La clé de chiffrement doit faire 32 octets.');
    }
  }

  encrypt(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const payload = Buffer.concat([iv, cipher.getAuthTag(), data]);
    return `${VERSION}:${payload.toString('base64')}`;
  }

  decrypt(sealed: string): string {
    const [version, encoded] = sealed.split(':');
    if (version !== VERSION || !encoded) {
      throw new Error('Format de secret chiffré inconnu.');
    }
    const payload = Buffer.from(encoded, 'base64');
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.key,
      payload.subarray(0, 12),
    );
    decipher.setAuthTag(payload.subarray(12, 28));
    return Buffer.concat([
      decipher.update(payload.subarray(28)),
      decipher.final(),
    ]).toString('utf8');
  }
}
