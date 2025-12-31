import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import { User } from '../models/User';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Auth routes', () => {
  const email = 'user@example.com';
  const password = 'StrongP@ssw0rd!';

  it('registers a user and returns tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201);

    expect(res.body.user.email).toBe(email);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();

    const stored = await User.findOne({ email });
    expect(stored).not.toBeNull();
    expect(stored?.passwordHash).not.toBe(password);
  });

  it('logs in an existing user', async () => {
    await request(app).post('/api/auth/register').send({ email, password }).expect(201);

    const res = await request(app).post('/api/auth/login').send({ email, password }).expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    await request(app).post('/api/auth/register').send({ email, password }).expect(201);

    await request(app).post('/api/auth/login').send({ email, password: 'wrong' }).expect(401);
  });

  it('refreshes tokens', async () => {
    const register = await request(app).post('/api/auth/register').send({ email, password }).expect(201);

    const refreshToken = register.body.refreshToken;
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken }).expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(refreshToken);
  });
});
