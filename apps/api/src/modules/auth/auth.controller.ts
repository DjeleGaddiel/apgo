import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';
import type { Env } from '../../config/env';
import {
  Authenticated,
  CurrentUser,
  Public,
} from '../access/access.decorators';
import { ACCESS_TOKEN_TTL_SECONDS } from '../access/access-token.service';
import type { AuthenticatedUser } from '../access/authenticated-user';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_COOKIE_PATH,
} from '../access/session-cookies';
import { AuthOutcome, AuthService } from './auth.service';
import { AuthResultDto } from './dto/auth-result.dto';
import { ClientKind } from './dto/client-kind';
import { CurrentUserDto } from './dto/current-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import {
  TwoFactorChallengeDto,
  TwoFactorSetupDto,
  TwoFactorVerifyDto,
} from './dto/two-factor.dto';
import { REFRESH_TOKEN_TTL_DAYS } from './refresh-token.service';
import { SessionExpiredException } from './auth.errors';

/** Limite renforcée sur les routes sensibles, par adresse IP. */
const SENSITIVE = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly secureCookies: boolean;

  constructor(
    private readonly auth: AuthService,
    config: ConfigService<Env, true>,
  ) {
    this.secureCookies = config.get('COOKIE_SECURE', { infer: true });
  }

  @Post('register')
  @Public()
  @Throttle(SENSITIVE)
  @ApiOperation({ summary: 'Créer un compte apprenant et ouvrir une session' })
  @ApiCreatedResponse({ type: AuthResultDto })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResultDto> {
    const outcome = await this.auth.registerLearner(dto, contextOf(req));
    return this.respond(outcome, dto.client, res);
  }

  @Post('register/trainer')
  @Public()
  @Throttle(SENSITIVE)
  @ApiOperation({
    summary: 'Demander un compte formateur (validé ensuite par un admin)',
  })
  @ApiCreatedResponse({ type: AuthResultDto })
  async registerTrainer(@Body() dto: RegisterDto): Promise<AuthResultDto> {
    return { status: (await this.auth.registerTrainer(dto)).status };
  }

  @Post('login')
  @Public()
  @Throttle(SENSITIVE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Se connecter avec email et mot de passe' })
  @ApiOkResponse({ type: AuthResultDto })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResultDto> {
    const outcome = await this.auth.login(
      dto.email,
      dto.password,
      contextOf(req),
    );
    return this.respond(outcome, dto.client, res);
  }

  @Post('two-factor/setup')
  @Public()
  @Throttle(SENSITIVE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Configurer la double authentification (première connexion d’un admin)',
  })
  @ApiOkResponse({ type: TwoFactorSetupDto })
  setUpTwoFactor(
    @Body() dto: TwoFactorChallengeDto,
  ): Promise<TwoFactorSetupDto> {
    return this.auth.setUpTwoFactor(dto.challengeToken);
  }

  @Post('two-factor/verify')
  @Public()
  @Throttle(SENSITIVE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Valider le code de double authentification' })
  @ApiOkResponse({ type: AuthResultDto })
  async verifyTwoFactor(
    @Body() dto: TwoFactorVerifyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResultDto> {
    const outcome = await this.auth.verifyTwoFactor(
      dto.challengeToken,
      dto.code,
      contextOf(req),
    );
    return this.respond(outcome, dto.client, res);
  }

  @Post('refresh')
  @Public()
  @Throttle(SENSITIVE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renouveler la session (le jeton est remplacé à chaque appel)',
  })
  @ApiOkResponse({ type: AuthResultDto })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResultDto> {
    const token = dto.refreshToken ?? refreshCookieOf(req);
    if (!token) throw new SessionExpiredException();
    try {
      const outcome = await this.auth.refresh(token, contextOf(req));
      return this.respond(outcome, dto.client, res);
    } catch (error) {
      this.clearCookies(res);
      throw error;
    }
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Fermer la session en cours' })
  @ApiNoContentResponse()
  async logout(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.auth.logout(dto.refreshToken ?? refreshCookieOf(req));
    this.clearCookies(res);
  }

  @Get('me')
  @Authenticated()
  @ApiOperation({
    summary: 'Utilisateur connecté, son rôle et ses permissions',
  })
  @ApiOkResponse({ type: CurrentUserDto })
  me(@CurrentUser() user: AuthenticatedUser): Promise<CurrentUserDto> {
    return this.auth.me(user.id);
  }

  /** Sur le web, les jetons partent dans des cookies et ne figurent pas dans la réponse. */
  private respond(
    outcome: AuthOutcome,
    client: ClientKind = 'web',
    res: Response,
  ): AuthResultDto {
    if (outcome.status !== 'AUTHENTICATED') {
      return outcome;
    }
    const { session, user } = outcome;
    if (client === 'mobile') {
      return {
        status: outcome.status,
        user,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        accessTokenExpiresAt: session.accessTokenExpiresAt.toISOString(),
      };
    }
    res.cookie(ACCESS_COOKIE, session.accessToken, {
      ...this.cookieBase(),
      path: '/api',
      maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
    });
    res.cookie(REFRESH_COOKIE, session.refreshToken, {
      ...this.cookieBase(),
      path: REFRESH_COOKIE_PATH,
      maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    });
    return {
      status: outcome.status,
      user,
      accessTokenExpiresAt: session.accessTokenExpiresAt.toISOString(),
    };
  }

  private clearCookies(res: Response): void {
    res.clearCookie(ACCESS_COOKIE, { ...this.cookieBase(), path: '/api' });
    res.clearCookie(REFRESH_COOKIE, {
      ...this.cookieBase(),
      path: REFRESH_COOKIE_PATH,
    });
  }

  private cookieBase(): CookieOptions {
    return { httpOnly: true, secure: this.secureCookies, sameSite: 'lax' };
  }
}

function contextOf(req: Request) {
  return { ip: req.ip, userAgent: req.header('user-agent') };
}

function refreshCookieOf(req: Request): string | undefined {
  return (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
}
