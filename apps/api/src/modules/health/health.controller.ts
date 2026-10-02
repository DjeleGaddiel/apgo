import { Controller, Get, HttpStatus } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiException } from '../../common/errors/api.exception';
import { CommonErrorCode } from '../../common/errors/common.errors';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Public } from '../access/access.decorators';

class HealthDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok';
}

/** Surveillance de la disponibilité (Uptime Kuma, Coolify). */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @SkipThrottle()
  @ApiOperation({ summary: 'État de l’API et de sa base de données' })
  @ApiOkResponse({ type: HealthDto })
  async check(): Promise<HealthDto> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ApiException(
        HttpStatus.SERVICE_UNAVAILABLE,
        CommonErrorCode.SERVICE_UNAVAILABLE,
        'Base de données injoignable.',
      );
    }
    return { status: 'ok' };
  }
}
