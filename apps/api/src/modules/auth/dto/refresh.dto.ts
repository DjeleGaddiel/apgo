import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ClientKind, CLIENT_KINDS } from './client-kind';

/** Le site web n'envoie rien : le jeton est dans un cookie. L'application mobile l'envoie ici. */
export class RefreshDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  refreshToken?: string;

  @ApiPropertyOptional({ enum: CLIENT_KINDS, default: 'web' })
  @IsOptional()
  @IsIn(CLIENT_KINDS)
  client?: ClientKind;
}
