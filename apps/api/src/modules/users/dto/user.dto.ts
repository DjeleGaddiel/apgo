import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../../generated/prisma/enums';
import { RoleSummaryDto } from '../../auth/dto/current-user.dto';

/** Compte vu par l'administration. Jamais de mot de passe ni de secret. */
export class UserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ enum: UserStatus, enumName: 'UserStatus' })
  status!: UserStatus;

  @ApiProperty({ example: 'fr' })
  locale!: string;

  @ApiProperty({ type: RoleSummaryDto })
  role!: RoleSummaryDto;

  @ApiProperty()
  twoFactorEnabled!: boolean;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  lastLoginAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class UserPageDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty({ type: [UserDto] })
  items!: UserDto[];
}
