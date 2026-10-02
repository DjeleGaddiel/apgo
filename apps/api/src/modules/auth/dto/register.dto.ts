import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ClientKind, CLIENT_KINDS } from './client-kind';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class RegisterDto {
  @ApiProperty({ example: 'ama.kouassi@exemple.ci', maxLength: 254 })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ minLength: 10, maxLength: 128 })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ example: 'Ama', maxLength: 100 })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Kouassi', maxLength: 100 })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({ enum: ['fr', 'goa'], default: 'fr' })
  @IsOptional()
  @IsIn(['fr', 'goa'])
  locale?: string;

  @ApiPropertyOptional({ enum: CLIENT_KINDS, default: 'web' })
  @IsOptional()
  @IsIn(CLIENT_KINDS)
  client?: ClientKind;
}
