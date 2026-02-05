import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { PROJECT_NAME } from '@codejam/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  // Zod validation pipe 설정
  app.useGlobalPipes(new ZodValidationPipe());

  // 전역 예외 필터 등록
  app.useGlobalFilters(new HttpExceptionFilter());

  // Caddy(Reverse Proxy)를 신뢰하도록 설정
  app.set('trust proxy', 1);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(port);
  console.log(`🚀 ${PROJECT_NAME} Server (NestJS) running on port ${port}`);
}
void bootstrap();
