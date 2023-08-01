import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as fs from 'fs';

import RedisStore from 'connect-redis';
import * as session from 'express-session';
import * as passport from 'passport';
import { createClient } from 'redis';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.cert'),
  }

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));

  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api');

  // Redis
  const redisClient = createClient({
    url: 'redis://redis-container:6379'
  });
  redisClient.connect().catch(console.error);

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'myapp',
  });

  app.use(
    session({
      store: redisStore,
      resave: false,
      saveUninitialized: false,
      secret: "hogehoge",
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
