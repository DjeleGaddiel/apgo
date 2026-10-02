import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser, RequirePermissions } from '../access/access.decorators';
import type { AuthenticatedUser } from '../access/authenticated-user';
import { Permission } from '../access/permissions';
import { ListUsersQueryDto } from './dto/list-users.query.dto';
import { UserDto, UserPageDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({
    summary: 'Lister les comptes (filtres : état, rôle, recherche)',
  })
  @ApiOkResponse({ type: UserPageDto })
  list(@Query() query: ListUsersQueryDto): Promise<UserPageDto> {
    return this.users.list(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: 'Consulter un compte' })
  @ApiOkResponse({ type: UserDto })
  get(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto> {
    return this.users.get(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.USERS_MANAGE)
  @ApiOperation({ summary: 'Valider un compte formateur en attente' })
  @ApiOkResponse({ type: UserDto })
  approve(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<UserDto> {
    return this.users.approve(actor, id, req.ip);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.USERS_MANAGE)
  @ApiOperation({ summary: 'Suspendre un compte (ses sessions sont fermées)' })
  @ApiOkResponse({ type: UserDto })
  suspend(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<UserDto> {
    return this.users.suspend(actor, id, req.ip);
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.USERS_MANAGE)
  @ApiOperation({ summary: 'Réactiver un compte suspendu' })
  @ApiOkResponse({ type: UserDto })
  reactivate(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<UserDto> {
    return this.users.reactivate(actor, id, req.ip);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.USERS_MANAGE)
  @ApiOperation({
    summary: 'Supprimer un compte (données personnelles effacées)',
  })
  @ApiNoContentResponse()
  remove(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<void> {
    return this.users.remove(actor, id, req.ip);
  }
}
