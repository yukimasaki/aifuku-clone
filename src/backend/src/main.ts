import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as fs from 'fs';

import RedisStore from 'connect-redis';
import * as session from 'express-session';
import * as passport from 'passport';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.cert'),
  }

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));

  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api');

  // Redis
  const redisClient = createClient({
    url: configService.get('REDIS_URL'),
  });
  redisClient.connect().catch(console.error);

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'aifuku',
  });

  app.use(
    session({
      store: redisStore,
      resave: false,
      saveUninitialized: false,
      secret: configService.get('SESSION_SECRET') || 'secret',
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
