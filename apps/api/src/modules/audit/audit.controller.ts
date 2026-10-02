import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../access/access.decorators';
import { Permission } from '../access/permissions';
import { AuditService } from './audit.service';
import { AuditLogPageDto } from './dto/audit-log.dto';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs.query.dto';

@ApiTags('audit')
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @RequirePermissions(Permission.AUDIT_READ)
  @ApiOperation({
    summary:
      'Journal des actions des administrateurs, du plus récent au plus ancien',
  })
  @ApiOkResponse({ type: AuditLogPageDto })
  list(@Query() query: ListAuditLogsQueryDto): Promise<AuditLogPageDto> {
    return this.audit.list(query);
  }
}
