import { ApiProperty } from '@nestjs/swagger';

export class AuditActorDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;
}

export class AuditLogDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'user.suspend' })
  action!: string;

  @ApiProperty({ example: 'user' })
  targetType!: string;

  @ApiProperty({ type: String, nullable: true })
  targetId!: string | null;

  @ApiProperty({ type: 'object', additionalProperties: true })
  metadata!: Record<string, unknown>;

  @ApiProperty({ type: String, nullable: true })
  ip!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: AuditActorDto, nullable: true })
  actor!: AuditActorDto | null;
}

export class AuditLogPageDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty({ type: [AuditLogDto] })
  items!: AuditLogDto[];
}
