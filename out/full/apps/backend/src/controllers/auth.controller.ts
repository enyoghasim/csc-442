import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { SessionData } from 'express-session';
import { AuthService } from '../services/auth/auth.service';
import { successResponse } from '../common/utils/response-factory';
import { toPublicUser } from '../common/utils/serialize-user';
import { LoginRequest } from '../dtos/auth.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { LoginDocs, LogoutDocs, MeDocs } from '../common/api-docs/auth.docs';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginDocs()
  async login(@Body() body: LoginRequest, @Session() session: SessionData) {
    const user = await this.authService.login(body.identifier, body.password);
    // Session only ever holds the id — role is looked up fresh from the DB wherever it's needed
    // for an authorization check, never trusted from a value cached at login time.
    session.userId = user.id;

    return successResponse({ user: toPublicUser(user) });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  @LogoutDocs()
  async logout(@Req() request: Request) {
    await new Promise<void>((resolve) =>
      request.session.destroy(() => resolve()),
    );
    return successResponse(null);
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  @MeDocs()
  async me(@Req() request: Request) {
    const user = await this.authService.getById(request.currentUserId!);
    return successResponse(toPublicUser(user));
  }
}
