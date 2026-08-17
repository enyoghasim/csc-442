import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // HttpException#getResponse() returns the raw body Nest built for the exception — for
    // `new XException('a string')` that's `{ statusCode, message, error }`, not just the
    // string, so unwrap `.message` (also covers ValidationPipe's `message: string[]`) rather
    // than nesting that whole object under our own `error.message`.
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse &&
            typeof exceptionResponse === 'object' &&
            'message' in exceptionResponse
          ? exceptionResponse.message
          : 'Internal server error';

    response.status(status).json({
      success: false,
      error: { statusCode: status, message },
    });
  }
}
