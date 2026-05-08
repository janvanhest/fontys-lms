import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/configure-app';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ name: 'Fontys LMS API', version: '1.0.0' });
  });

  it('/echo (POST) accepteert een geldig DTO-body', () => {
    return request(app.getHttpServer())
      .post('/echo')
      .send({ message: 'Hallo Fontys' })
      .expect(201)
      .expect({ message: 'Hallo Fontys' });
  });

  it('/echo (POST) weigert onbekende velden', () => {
    return request(app.getHttpServer())
      .post('/echo')
      .send({ message: 'Hallo Fontys', extra: true })
      .expect(400);
  });

  it('/echo (POST) valideert verplichte velden', () => {
    return request(app.getHttpServer()).post('/echo').send({}).expect(400);
  });

  afterAll(async () => {
    await app.close();
  });
});
