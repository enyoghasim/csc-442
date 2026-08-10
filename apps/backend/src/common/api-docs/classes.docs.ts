import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { errorExample } from '../utils/api-docs.util';
import { successResponse } from '../utils/response-factory';
import { CLASS_EXAMPLE } from './examples';

/**
 * One decorator per `ClassesController` route, composed with `applyDecorators` — same pattern
 * as `common/api-docs/auth.docs.ts`.
 */

export function ListClassesDocs() {
  return applyDecorators(
    ApiCookieAuth('connect.sid'),
    ApiOperation({
      summary: 'List classes for the current user',
      description:
        'Lecturers get classes they teach; students get classes they are enrolled in.',
    }),
    ApiOkResponse({
      schema: { example: successResponse([CLASS_EXAMPLE]) },
    }),
    ApiUnauthorizedResponse({
      description: 'No/invalid/expired session.',
      schema: { example: errorExample(401, 'Not authenticated') },
    }),
  );
}

export function CreateClassDocs() {
  return applyDecorators(
    ApiCookieAuth('connect.sid'),
    ApiOperation({ summary: 'Create a class (lecturer only)' }),
    ApiOkResponse({
      schema: { example: successResponse(CLASS_EXAMPLE) },
    }),
    ApiUnauthorizedResponse({
      schema: { example: errorExample(401, 'Not authenticated') },
    }),
    ApiForbiddenResponse({
      description: 'Authenticated as a student, not a lecturer.',
      schema: {
        example: errorExample(403, 'Insufficient role for this route'),
      },
    }),
    ApiConflictResponse({
      schema: {
        example: errorExample(409, 'A class with that code already exists'),
      },
    }),
  );
}

export function UpdateClassDocs() {
  return applyDecorators(
    ApiCookieAuth('connect.sid'),
    ApiOperation({
      summary: 'Update a class (lecturer only, must own the class)',
    }),
    ApiOkResponse({
      schema: { example: successResponse(CLASS_EXAMPLE) },
    }),
    ApiForbiddenResponse({
      description: "Not this class's lecturer.",
      schema: { example: errorExample(403, "You don't own this class") },
    }),
    ApiNotFoundResponse({
      schema: { example: errorExample(404, 'Class not found') },
    }),
  );
}

export function EnrollStudentDocs() {
  return applyDecorators(
    ApiCookieAuth('connect.sid'),
    ApiOperation({
      summary: 'Enroll a student into a class by regNumber (lecturer only)',
    }),
    ApiOkResponse({
      schema: { example: successResponse(null) },
    }),
    ApiForbiddenResponse({
      description: "Not this class's lecturer.",
      schema: { example: errorExample(403, "You don't own this class") },
    }),
    ApiNotFoundResponse({
      schema: {
        example: errorExample(404, 'No student found with that regNumber'),
      },
    }),
  );
}
