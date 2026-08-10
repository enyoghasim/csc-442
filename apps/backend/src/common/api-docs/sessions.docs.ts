import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { errorExample } from '../utils/api-docs.util';
import { successResponse } from '../utils/response-factory';
import { CLASS_SESSION_EXAMPLE, QR_TOKEN_EXAMPLE } from './examples';

/**
 * One decorator per `SessionsController` route, composed with `applyDecorators` — same pattern
 * as `common/api-docs/auth.docs.ts`.
 */

export function ListSessionsDocs() {
  return applyDecorators(
    ApiCookieAuth('connect.sid'),
    ApiOperation({
      summary: 'List class sessions for the current user',
      description:
        'Lecturers get sessions for classes they teach; students get sessions for classes ' +
        'they are enrolled in.',
    }),
    ApiOkResponse({
      schema: { example: successResponse([CLASS_SESSION_EXAMPLE]) },
    }),
    ApiUnauthorizedResponse({
      schema: { example: errorExample(401, 'Not authenticated') },
    }),
  );
}

export function ScheduleSessionDocs() {
  return applyDecorators(
    ApiCookieAuth('connect.sid'),
    ApiOperation({
      summary: 'Schedule a class session (lecturer only, must own the class)',
    }),
    ApiOkResponse({
      schema: { example: successResponse(CLASS_SESSION_EXAMPLE) },
    }),
    ApiBadRequestResponse({
      schema: { example: errorExample(400, 'endsAt must be after startsAt') },
    }),
    ApiForbiddenResponse({
      schema: { example: errorExample(403, "You don't own this class") },
    }),
    ApiNotFoundResponse({
      schema: { example: errorExample(404, 'Class not found') },
    }),
  );
}

export function GetQrTokenDocs() {
  return applyDecorators(
    ApiCookieAuth('connect.sid'),
    ApiOperation({
      summary:
        'Issue a fresh rotating QR check-in token for an active session (lecturer only)',
      description:
        'Overwrites whatever token was previously in Redis for this session — poll this ' +
        'endpoint to keep a displayed QR code rotating.',
    }),
    ApiOkResponse({
      schema: { example: successResponse(QR_TOKEN_EXAMPLE) },
    }),
    ApiBadRequestResponse({
      description: 'Session has not started yet, or has already ended.',
      schema: {
        example: errorExample(400, 'Session is not currently active'),
      },
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
