import { ConfigService } from '@nestjs/config';
import { generate } from 'otplib';
import type { Env } from '../../config/env';
import { SecretBox } from './secret-box';
import { TwoFactorService } from './two-factor.service';

describe('TwoFactorService', () => {
  const key = Buffer.alloc(32, 3).toString('base64');
  const service = new TwoFactorService({
    get: () => key,
  } as unknown as ConfigService<Env, true>);

  it('crée un secret chiffré et un lien pour l’application d’authentification', () => {
    const { secret, otpauthUri, sealed } =
      service.createSecret('admin@apgo.ci');
    expect(otpauthUri).toContain('otpauth://totp/');
    expect(otpauthUri).toContain('issuer=APGO');
    expect(sealed).not.toContain(secret);
    expect(new SecretBox(key).decrypt(sealed)).toBe(secret);
  });

  it('accepte le code courant et refuse un code faux', async () => {
    const { secret, sealed } = service.createSecret('admin@apgo.ci');
    const code = await generate({ secret });
    await expect(service.isValidCode(sealed, code)).resolves.toBe(true);
    const wrong = code === '000000' ? '111111' : '000000';
    await expect(service.isValidCode(sealed, wrong)).resolves.toBe(false);
  });
});
