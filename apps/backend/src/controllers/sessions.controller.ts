import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { UserRole } from '@attendance/shared';
import { ClassSessionsService } from '../services/class-sessions/class-sessions.service';
import { successResponse } from '../common/utils/response-factory';
import { ListSessionsQuery, ScheduleClassSessionRequest } from '../dtos/sessions.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  EndSessionDocs,
  GetQrTokenDocs,
  ListSessionsDocs,
  ScheduleSessionDocs,
} from '../common/api-docs/sessions.docs';

// Route path is "sessions" (class sessions) — distinct from Redis-backed auth sessions.
@ApiTags('sessions')
@Controller('sessions')
@UseGuards(SessionAuthGuard)
export class SessionsController {
  constructor(private readonly classSessionsService: ClassSessionsService) {}

  @Get()
  @ListSessionsDocs()
  async list(@Req() request: Request, @Query() query: ListSessionsQuery) {
    const res = await this.classSessionsService.listForCurrentUser(
      request.currentUserId!,
      query,
    );
    return successResponse(res);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.Lecturer)
  @ScheduleSessionDocs()
  async schedule(
    @Req() request: Request,
    @Body() body: ScheduleClassSessionRequest,
  ) {
    const created = await this.classSessionsService.schedule(
      request.currentUserId!,
      body,
    );
    return successResponse(created);
  }

  // Rotating QR token — the dashboard polls this while a session's live-QR page is open.
  @Get(':id/qr-token')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Lecturer)
  @GetQrTokenDocs()
  async qrToken(
    @Req() request: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const token = await this.classSessionsService.issueQrToken(
      request.currentUserId!,
      id,
    );
    return successResponse(token);
  }

  // Ends a live session early instead of waiting for its scheduled endsAt.
  @Patch(':id/end')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Lecturer)
  @EndSessionDocs()
  async end(@Req() request: Request, @Param('id', ParseUUIDPipe) id: string) {
    const session = await this.classSessionsService.endSession(
      request.currentUserId!,
      id,
    );
    return successResponse(session);
  }
}
