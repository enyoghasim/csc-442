import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserRole } from '@attendance/shared';
import { AttendanceService } from '../services/attendance/attendance.service';
import { successResponse } from '../common/utils/response-factory';
import { AttendanceHistoryQuery, CheckInRequest } from '../dtos/attendance.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CheckInDocs,
  ClassSummaryDocs,
  MyAttendanceDocs,
  SessionRosterDocs,
} from '../common/api-docs/attendance.docs';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(SessionAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ThrottlerGuard here (module-scoped config in AttendanceModule) limits check-in attempts per
  // IP — scanning/re-scanning a QR code shouldn't need more than a handful of requests a minute.
  @Post('check-in')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard, RolesGuard)
  @Roles(UserRole.Student)
  @CheckInDocs()
  async checkIn(@Req() request: Request, @Body() body: CheckInRequest) {
    await this.attendanceService.checkIn(
      request.currentUserId!,
      body.classSessionId,
      body.token,
    );
    return successResponse(null);
  }

  @Get('me')
  @MyAttendanceDocs()
  async myAttendance(
    @Req() request: Request,
    @Query() query: AttendanceHistoryQuery,
  ) {
    const history = await this.attendanceService.historyForStudent(
      request.currentUserId!,
      query.month,
      query.year,
    );
    return successResponse(history);
  }

  @Get('sessions/:sessionId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Lecturer)
  @SessionRosterDocs()
  async sessionRoster(
    @Req() request: Request,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    const roster = await this.attendanceService.rosterForSession(
      request.currentUserId!,
      sessionId,
    );
    return successResponse(roster);
  }

  @Get('classes/:classId/summary')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Lecturer)
  @ClassSummaryDocs()
  async classSummary(
    @Req() request: Request,
    @Param('classId', ParseUUIDPipe) classId: string,
  ) {
    const summary = await this.attendanceService.classSummary(
      request.currentUserId!,
      classId,
    );
    return successResponse(summary);
  }

  // Bypasses the successResponse() envelope on purpose — this is a raw CSV file download, not a
  // JSON API response. Errors still go through the global HttpExceptionFilter as normal.
  @Get('classes/:classId/summary/export')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Lecturer)
  async exportClassSummary(
    @Req() request: Request,
    @Param('classId', ParseUUIDPipe) classId: string,
    @Res() response: Response,
  ) {
    const csv = await this.attendanceService.classSummaryCsv(
      request.currentUserId!,
      classId,
    );
    response.setHeader('Content-Type', 'text/csv');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="class-${classId}-attendance.csv"`,
    );
    response.send(csv);
  }
}
