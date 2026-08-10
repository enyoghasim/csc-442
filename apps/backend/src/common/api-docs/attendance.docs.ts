import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { errorExample } from '../utils/api-docs.util';
import { successResponse } from '../utils/response-factory';
import {
  ATTENDANCE_HISTORY_DAY_EXAMPLE,
  CLASS_SUMMARY_EXAMPLE,
  SESSION_ROSTER_EXAMPLE,
} from './examples';

/**
 * One decorator per `AttendanceController` route, composed with `applyDecorators` — same
 * pattern as `common/api-docs/auth.docs.ts`.
 */

export function CheckInDocs() {
  return applyDecorators(
    ApiCookieAuth('connect.sid'),
    ApiOperation({
      summary:
        'Check in to a class session by scanning its QR code (student only)',
      description:
        'Validates the session is currently active, the student is enrolled in its class, ' +
        'and the token matches the current rotating token in Redis, then writes an ' +
        "attendance record with status 'present'. Rate-limited per IP.",
    }),
    ApiOkResponse({ schema: { example: successResponse(null) } }),
    ApiBadRequestResponse({
      description:
        'Check-in window closed, or the QR token is invalid/expired.',
      schema: { example: errorExample(400, 'Invalid or expired QR code') },
    }),
    ApiForbiddenResponse({
      schema: {
        example: errorExample(403, 'You are not enrolled in this class'),
      },
    }),
    ApiNotFoundResponse({
      schema: { example: errorExample(404, 'Class session not found') },
    }),
    ApiConflictResponse({
      schema: {
        example: errorExample(409, 'Already checked in for this session'),
      },
    }),
    ApiTooManyRequestsResponse({
      schema: {
        example: errorExample(429, 'ThrottlerException: Too Many Requests'),
      },
    }),
  );
}

export function MyAttendanceDocs() {
  return applyDecorators(
    ApiCookieAuth('connect.sid'),
    ApiOperation({
      summary:
        "The current student's own attendance history for one calendar month",
      description:
        'One entry per day of the given month (dense — every day, not just days with a ' +
        "session), so the client can fetch a month at a time as the calendar's visible month " +
        "changes rather than paging through the student's entire history.",
    }),
    ApiQuery({ name: 'month', example: 8, description: '1-12' }),
    ApiQuery({ name: 'year', example: 2026 }),
    ApiOkResponse({
      schema: { example: successResponse([ATTENDANCE_HISTORY_DAY_EXAMPLE]) },
    }),
    ApiBadRequestResponse({
      description: 'month/year missing or out of range.',
      schema: {
        example: errorExample(400, [
          'month must not be greater than 12',
          'year must not be less than 2000',
        ]),
      },
    }),
    ApiUnauthorizedResponse({
      schema: { example: errorExample(401, 'Not authenticated') },
    }),
  );
}

export function SessionRosterDocs() {
  return applyDecorators(
    ApiCookieAuth('connect.sid'),
    ApiOperation({
      summary:
        'Per-session attendance roster — every enrolled student, absent by default (lecturer only)',
    }),
    ApiOkResponse({
      schema: { example: successResponse([SESSION_ROSTER_EXAMPLE]) },
    }),
    ApiForbiddenResponse({
      schema: {
        example: errorExample(403, "You don't own this class session"),
      },
    }),
    ApiNotFoundResponse({
      schema: { example: errorExample(404, 'Class session not found') },
    }),
  );
}

export function ClassSummaryDocs() {
  return applyDecorators(
    ApiCookieAuth('connect.sid'),
    ApiOperation({
      summary:
        'Per-class attendance summary — sessions present / total sessions per student (lecturer only)',
    }),
    ApiOkResponse({
      schema: { example: successResponse([CLASS_SUMMARY_EXAMPLE]) },
    }),
    ApiForbiddenResponse({
      schema: { example: errorExample(403, "You don't own this class") },
    }),
    ApiNotFoundResponse({
      schema: { example: errorExample(404, 'Class not found') },
    }),
  );
}
