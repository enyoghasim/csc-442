import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { connectRedis } from './config/redis';
import { sessionMiddleware } from './config/session';
import { env } from './config/env';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  await connectRedis();

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : true;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.use(sessionMiddleware);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  // Both dashboard and mobile authenticate via the same `connect.sid` cookie — mobile's axios
  // client is configured with `withCredentials: true` so it stores/resends it just like a browser.
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Attendance Tracker API')
      .setDescription(
        'apps/backend — the Attendance Tracking System backend API',
      )
      .setVersion('0.1')
      .addCookieAuth('connect.sid')
      .build(),
  );
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  await app.listen(env.BACKEND_PORT);
}

void bootstrap();
