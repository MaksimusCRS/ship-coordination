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

  // Add tests for collision detection
  it('should return yellow status for potentially dangerous proximity', async () => {
    // Ship 1: Position at (0, 0) moving at speed 1 toward (1, 1)
    const time1 = Math.floor(Date.now() / 1000);
    await request(app.getHttpServer())
      .post('/v1/api/ships/ship1/position')
      .send({ time: time1, x: 0, y: 0 })
      .expect(201);

    // Ship 2: Position at (1, 1) moving at speed 1 toward (0, 0)
    const time2 = time1 + 1; // 1 second after ship1's position
    const res2 = await request(app.getHttpServer())
      .post('/v1/api/ships/ship2/position')
      .send({ time: time2, x: 1, y: 1 })
      .expect(201);

    expect(res2.body.status).toBe('yellow');
  });

  it('should return red status for imminent collision', async () => {
    // Ship 1: Position at (0, 0) moving at speed 1 toward (1, 0)
    const time1 = Math.floor(Date.now() / 1000);
    await request(app.getHttpServer())
      .post('/v1/api/ships/ship1/position')
      .send({ time: time1, x: 0, y: 0 })
      .expect(201);

    // Ship 2: Position at (1, 0) moving at speed 1 toward (0, 0)
    const time2 = time1 + 1; // 1 second after ship1's position
    const res2 = await request(app.getHttpServer())
      .post('/v1/api/ships/ship2/position')
      .send({ time: time2, x: 1, y: 0 })
      .expect(201);

    expect(res2.body.status).toBe('red');
  });

  // Add tests for invalid data
  it('should return 422 for time out of range', async () => {
    const time = Math.floor(Date.now() / 1000) - 120; // Time older than the last recorded

    const res = await request(app.getHttpServer())
      .post('/v1/api/ships/test-ship/position')
      .send({ time, x: 5, y: 5 })
      .expect(422);

    expect(res.body.error).toBe('Time out of range');
  });

  it('should return 400 for invalid coordinates', async () => {
    const time = Math.floor(Date.now() / 1000);

    const res = await request(app.getHttpServer())
      .post('/v1/api/ships/test-ship/position')
      .send({ time, x: 'invalid', y: 5 })
      .expect(400);

    expect(res.body.error).toBe('Validation failed');
  });
});
