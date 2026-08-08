import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectRedis } from './config/redis';
import { sessionMiddleware } from './config/session';
import { env } from './config/env';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  await connectRedis();

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  app.use(sessionMiddleware);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(env.BACKEND_PORT);
}

void bootstrap();
