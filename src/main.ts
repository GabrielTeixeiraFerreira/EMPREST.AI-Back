import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1', { exclude: ['/'] });
  app.enableCors({
    origin: (requestOrigin, callback) => {
      const configuredOrigins = process.env.CORS_ORIGIN
        ?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean) ?? [];
      const isDevelopmentOrigin =
        process.env.NODE_ENV !== 'production' &&
        (!requestOrigin ||
          requestOrigin === 'null' ||
          /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(
            requestOrigin,
          ));

      if (configuredOrigins.includes(requestOrigin ?? '') || isDevelopmentOrigin) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
  });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
