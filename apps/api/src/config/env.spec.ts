import { validateEnv } from './env';

const valid = {
  NODE_ENV: 'production',
  PORT: '3000',
  DATABASE_URL: 'postgresql://apgo:apgo@localhost:5432/apgo',
  JWT_ACCESS_SECRET: 'x'.repeat(32),
  TWO_FACTOR_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
  CORS_ORIGINS: 'https://apgo.example, https://admin.apgo.example',
  COOKIE_SECURE: 'true',
};

describe('validateEnv', () => {
  it('accepte une configuration complète', () => {
    const env = validateEnv(valid);
    expect(env.PORT).toBe(3000);
    expect(env.CORS_ORIGINS).toEqual([
      'https://apgo.example',
      'https://admin.apgo.example',
    ]);
    expect(env.COOKIE_SECURE).toBe(true);
  });

  it('liste toutes les variables manquantes ou invalides', () => {
    expect(() =>
      validateEnv({ ...valid, JWT_ACCESS_SECRET: 'court', DATABASE_URL: '' }),
    ).toThrow(/JWT_ACCESS_SECRET[\s\S]*DATABASE_URL/);
  });

  it('refuse des cookies non sécurisés en production', () => {
    expect(() => validateEnv({ ...valid, COOKIE_SECURE: 'false' })).toThrow(
      'COOKIE_SECURE',
    );
  });

  it('refuse une clé de chiffrement de mauvaise taille', () => {
    expect(() =>
      validateEnv({ ...valid, TWO_FACTOR_ENCRYPTION_KEY: 'YWJj' }),
    ).toThrow('TWO_FACTOR_ENCRYPTION_KEY');
  });
});
