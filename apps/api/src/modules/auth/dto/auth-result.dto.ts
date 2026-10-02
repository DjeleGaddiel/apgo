import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurrentUserDto } from './current-user.dto';

export const AUTH_STATUSES = [
  'AUTHENTICATED',
  'TWO_FACTOR_REQUIRED',
  'TWO_FACTOR_SETUP_REQUIRED',
  'PENDING_APPROVAL',
] as const;
export type AuthStatus = (typeof AUTH_STATUSES)[number];

/**
 * Résultat d'une étape d'authentification.
 * - `AUTHENTICATED` : session ouverte (cookies sur le web, jetons dans la réponse sur mobile).
 * - `TWO_FACTOR_REQUIRED` / `TWO_FACTOR_SETUP_REQUIRED` : envoyer `challengeToken` aux routes `two-factor`.
 * - `PENDING_APPROVAL` : compte formateur créé, en attente de validation.
 */
export class AuthResultDto {
  @ApiProperty({ enum: AUTH_STATUSES })
  status!: AuthStatus;

  @ApiPropertyOptional({ type: CurrentUserDto })
  user?: CurrentUserDto;

  @ApiPropertyOptional()
  challengeToken?: string;

  @ApiPropertyOptional({ description: 'Mobile uniquement.' })
  accessToken?: string;

  @ApiPropertyOptional({ description: 'Mobile uniquement.' })
  refreshToken?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  accessTokenExpiresAt?: string;
}
