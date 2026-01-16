import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import Redis from 'ioredis';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    try {
      const redisClient = app.get<Redis>('REDIS_CLIENT');
      const redisSubscriber = app.get<Redis>('REDIS_SUBSCRIBER');

      if (redisClient) redisClient.disconnect();
      if (redisSubscriber) redisSubscriber.disconnect();
    } catch {
      // Redis Provider를 못 찾거나 이미 닫혔으면 무시
    }

    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });
});
