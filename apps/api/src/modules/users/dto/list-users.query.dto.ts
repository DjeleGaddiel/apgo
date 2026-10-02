import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserStatus } from '../../../generated/prisma/enums';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

export class ListUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: UserStatus,
    enumName: 'UserStatus',
    description: 'Sans filtre, les comptes supprimés sont exclus.',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ example: 'TRAINER', description: 'Clé du rôle.' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  role?: string;

  @ApiPropertyOptional({
    description: 'Recherche dans le nom, le prénom et l’email.',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(100)
  search?: string;
}
