import { ApiProperty } from '@nestjs/swagger';
import { ALL_PERMISSIONS, Permission } from '../../access/permissions';

export class RoleSummaryDto {
  @ApiProperty({ example: 'LEARNER' })
  key!: string;

  @ApiProperty({ example: 'Apprenant' })
  name!: string;
}

export class CurrentUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ example: 'fr' })
  locale!: string;

  @ApiProperty({ type: RoleSummaryDto })
  role!: RoleSummaryDto;

  @ApiProperty({
    enum: ALL_PERMISSIONS,
    isArray: true,
    description:
      'Pour adapter l’interface ; les droits restent vérifiés par l’API.',
  })
  permissions!: Permission[];

  @ApiProperty()
  twoFactorEnabled!: boolean;
}
