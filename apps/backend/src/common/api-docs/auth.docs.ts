import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { errorExample } from '../utils/api-docs.util';
import { successResponse } from '../utils/response-factory';
import { PUBLIC_USER_EXAMPLE } from './examples';

/**
 * One decorator per `AuthController` route, composed with `applyDecorators` so the controller
 * only carries a single `@XDocs()` line — every `@Api*Response` example and description lives
 * here instead, mirroring the reference backend's `common/api-docs/` pattern.
 */

export function LoginDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Sign in with an email/regNumber identifier + password',
      description:
        '`identifier` is a lecturer email or a student regNumber, whichever matches. On success ' +
        'the httpOnly `connect.sid` session cookie is set on the response — both dashboard and ' +
        'mobile (axios `withCredentials: true`) store and resend it automatically on every ' +
        'later request, no session id in the response body to manage client-side.',
    }),
    ApiOkResponse({
      schema: {
        example: successResponse({ user: PUBLIC_USER_EXAMPLE }),
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Wrong credentials or unknown identifier.',
      schema: { example: errorExample(401, 'Invalid credentials') },
    }),
  );
}

export function MeDocs() {
  return applyDecorators(
    ApiCookieAuth('connect.sid'),
    ApiOperation({ summary: 'Get the current session user' }),
    ApiOkResponse({
      schema: { example: successResponse(PUBLIC_USER_EXAMPLE) },
    }),
    ApiUnauthorizedResponse({
      description: 'No/invalid/expired session.',
      schema: { example: errorExample(401, 'Not authenticated') },
    }),
  );
}

export function LogoutDocs() {
  return applyDecorators(
    ApiCookieAuth('connect.sid'),
    ApiOperation({ summary: 'Destroy the current session' }),
    ApiOkResponse({
      schema: { example: successResponse(null) },
    }),
  );
}
