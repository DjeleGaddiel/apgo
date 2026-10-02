import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ClientKind, CLIENT_KINDS } from './client-kind';

export class LoginDto {
  @ApiProperty({ example: 'ama.kouassi@exemple.ci' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({ enum: CLIENT_KINDS, default: 'web' })
  @IsOptional()
  @IsIn(CLIENT_KINDS)
  client?: ClientKind;
}
