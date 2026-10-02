// Variables d'environnement de l'API, validées au démarrage : l'API refuse de démarrer
// avec une configuration incomplète plutôt que d'échouer plus tard. Modèle : `.env.example`.

export interface Env {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL: string;
  /** Secret de signature des jetons d'accès (32 caractères minimum). */
  JWT_ACCESS_SECRET: string;
  /** Clé AES-256 en base64 (32 octets) qui chiffre les secrets de double authentification. */
  TWO_FACTOR_ENCRYPTION_KEY: string;
  /** Domaines autorisés à appeler l'API depuis un navigateur. */
  CORS_ORIGINS: string[];
  /** Cookies `Secure` : toujours vrai en production (HTTPS). */
  COOKIE_SECURE: boolean;
}

export function validateEnv(raw: Record<string, unknown>): Env {
  const errors: string[] = [];
  const str = (name: string): string => {
    const value = raw[name];
    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(`${name} est obligatoire`);
      return '';
    }
    return value.trim();
  };

  const nodeEnv = (raw['NODE_ENV'] as string | undefined) ?? 'development';
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    errors.push('NODE_ENV doit valoir development, test ou production');
  }

  const port = Number(raw['PORT'] ?? 3000);
  if (!Number.isInteger(port) || port <= 0) {
    errors.push('PORT doit être un nombre entier positif');
  }

  const jwtSecret = str('JWT_ACCESS_SECRET');
  if (jwtSecret && jwtSecret.length < 32) {
    errors.push('JWT_ACCESS_SECRET doit contenir au moins 32 caractères');
  }

  const twoFactorKey = str('TWO_FACTOR_ENCRYPTION_KEY');
  if (twoFactorKey && Buffer.from(twoFactorKey, 'base64').length !== 32) {
    errors.push(
      'TWO_FACTOR_ENCRYPTION_KEY doit être une clé de 32 octets encodée en base64',
    );
  }

  const corsOrigins = str('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const cookieSecure = (raw['COOKIE_SECURE'] ?? 'true') !== 'false';
  if (nodeEnv === 'production' && !cookieSecure) {
    errors.push('COOKIE_SECURE ne peut pas valoir false en production');
  }

  const databaseUrl = str('DATABASE_URL');

  if (errors.length > 0) {
    throw new Error(`Configuration invalide :\n- ${errors.join('\n- ')}`);
  }

  return {
    NODE_ENV: nodeEnv as Env['NODE_ENV'],
    PORT: port,
    DATABASE_URL: databaseUrl,
    JWT_ACCESS_SECRET: jwtSecret,
    TWO_FACTOR_ENCRYPTION_KEY: twoFactorKey,
    CORS_ORIGINS: corsOrigins,
    COOKIE_SECURE: cookieSecure,
  };
}
