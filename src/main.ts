import { NestFactory } from '@nestjs/core';
//import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    "origin": "http://localhost:4200",
    "allowedHeaders":"*", 
    "credentials":true,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  });
  app.use(cookieParser());
  //app.useStaticAssets(path.join(__dirname,'..','pictures'));
  app.use('/pictures', express.static(path.join(__dirname, '..', 'pictures')));
  await app.listen(3000);
}
bootstrap();
