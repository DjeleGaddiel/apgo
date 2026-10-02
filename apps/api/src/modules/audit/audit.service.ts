import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs.query.dto';
import { AuditLogDto, AuditLogPageDto } from './dto/audit-log.dto';

export interface AuditEntry {
  actorId: string;
  /** `domaine.verbe` : `user.approve`, `user.suspend`… */
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Prisma.InputJsonObject;
  ip?: string;
}

/**
 * Journal des actions des administrateurs. Uniquement des ajouts et des lectures :
 * l'application n'offre aucun moyen de modifier ou supprimer une entrée.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** À appeler dans la même transaction que l'action journalisée quand c'est possible. */
  async record(
    entry: AuditEntry,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    await db.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        metadata: entry.metadata ?? {},
        ip: entry.ip,
      },
    });
  }

  async list(query: ListAuditLogsQueryDto): Promise<AuditLogPageDto> {
    const where: Prisma.AuditLogWhereInput = {
      actorId: query.actorId,
      action: query.action,
      targetType: query.targetType,
      targetId: query.targetId,
    };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          actor: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    return {
      total,
      page: query.page,
      pageSize: query.pageSize,
      items: rows.map((row): AuditLogDto => ({
        id: row.id,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
        metadata: row.metadata as Record<string, unknown>,
        ip: row.ip,
        createdAt: row.createdAt.toISOString(),
        actor: row.actor
          ? {
              id: row.actor.id,
              name: `${row.actor.firstName} ${row.actor.lastName}`.trim(),
            }
          : null,
      })),
    };
  }
}
