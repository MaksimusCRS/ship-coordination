import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Ship Coordination E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should flush all data', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/api/ships/flush')
      .expect(201);

    expect(res.body).toEqual({ message: 'All data flushed' });
  });

  it('should register a ship position and return green status', async () => {
    const time = Math.floor(Date.now() / 1000);

    const res = await request(app.getHttpServer())
      .post('/v1/api/ships/test-ship/position')
      .send({ time, x: 0, y: 0 })
      .expect(201);

    expect(res.body).toMatchObject({
      time,
      x: 0,
      y: 0,
      speed: 0,
      status: 'green',
    });
  });

  it('should return ship status in list', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/api/ships')
      .expect(200);

    expect(res.body.ships).toHaveLength(1);
    expect(res.body.ships[0]).toHaveProperty('id', 'test-ship');
  });

  it('should return ship position history', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/api/ships/test-ship')
      .expect(200);

    expect(res.body).toHaveProperty('id', 'test-ship');
    expect(res.body.positions.length).toBeGreaterThan(0);
    expect(res.body.positions[0]).toHaveProperty('position');
  });
});
