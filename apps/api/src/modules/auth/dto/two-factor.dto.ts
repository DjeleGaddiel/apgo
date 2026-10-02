import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ClientKind, CLIENT_KINDS } from './client-kind';

export class TwoFactorChallengeDto {
  @ApiProperty({
    description: 'Jeton reçu à la connexion (valable 5 minutes).',
  })
  @IsString()
  @MaxLength(2000)
  challengeToken!: string;
}

export class TwoFactorVerifyDto extends TwoFactorChallengeDto {
  @ApiProperty({
    example: '123456',
    description: 'Code à 6 chiffres de l’application.',
  })
  @Matches(/^\d{6}$/)
  code!: string;

  @ApiPropertyOptional({ enum: CLIENT_KINDS, default: 'web' })
  @IsOptional()
  @IsIn(CLIENT_KINDS)
  client?: ClientKind;
}

export class TwoFactorSetupDto {
  @ApiProperty({
    description: 'Secret à saisir à la main si le QR code ne peut pas être lu.',
  })
  secret!: string;

  @ApiProperty({ description: 'Lien `otpauth://` à afficher en QR code.' })
  otpauthUri!: string;
}
