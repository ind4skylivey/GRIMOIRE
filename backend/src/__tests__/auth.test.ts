import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../app';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { pruneExpiredTokens } from '../services/tokenService';

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

  const decodeJti = (token: string) => (jwt.decode(token) as { jti?: string })?.jti;

  it('registers a user and returns tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password })
      .expect(201);

    expect(res.body.user.email).toBe(email);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();

    const stored = await User.findOne({ email });
    expect(stored).not.toBeNull();
    expect(stored?.passwordHash).not.toBe(password);
    const savedRefresh = await RefreshToken.findOne({ user: stored?._id });
    expect(savedRefresh).not.toBeNull();
  });

  it('logs in an existing user', async () => {
    await request(app).post('/api/v1/auth/register').send({ email, password }).expect(201);

    const res = await request(app).post('/api/v1/auth/login').send({ email, password }).expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();

    const savedRefresh = await RefreshToken.findOne({ tokenId: decodeJti(res.body.refreshToken) });
    expect(savedRefresh).not.toBeNull();
  });

  it('rejects invalid credentials', async () => {
    await request(app).post('/api/v1/auth/register').send({ email, password }).expect(201);

    await request(app).post('/api/v1/auth/login').send({ email, password: 'wrongpassword' }).expect(401);
  });

  it('returns current user on /me when authorized', async () => {
    const register = await request(app).post('/api/v1/auth/register').send({ email, password }).expect(201);
    const accessToken = register.body.accessToken as string;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.user.email).toBe(email);
  });

  it('refreshes tokens', async () => {
    const register = await request(app).post('/api/v1/auth/register').send({ email, password }).expect(201);

    const refreshToken = register.body.refreshToken;
    const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken }).expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(refreshToken);

    // old token should be revoked and new stored
    const oldToken = await RefreshToken.findOne({ tokenId: decodeJti(refreshToken) });
    const newToken = await RefreshToken.findOne({ tokenId: decodeJti(res.body.refreshToken) });
    expect(oldToken?.revokedAt).not.toBeNull();
    expect(newToken).not.toBeNull();
  });

  it('rejects refresh with revoked token', async () => {
    const register = await request(app).post('/api/v1/auth/register').send({ email, password }).expect(201);
    const refreshToken = register.body.refreshToken;
    const jti = decodeJti(refreshToken);
    expect(jti).toBeDefined();
    if (jti) {
      await RefreshToken.findOneAndUpdate({ tokenId: jti }, { revokedAt: new Date() });
    }

    await request(app).post('/api/v1/auth/refresh').send({ refreshToken }).expect(401);
  });

  it('logs out and revokes refresh token', async () => {
    const register = await request(app).post('/api/v1/auth/register').send({ email, password }).expect(201);
    const refreshToken = register.body.refreshToken;
    const jti = decodeJti(refreshToken);

    await request(app).post('/api/v1/auth/logout').send({ refreshToken }).expect(204);

    const stored = await RefreshToken.findOne({ tokenId: jti });
    expect(stored?.revokedAt).not.toBeNull();

    await request(app).post('/api/v1/auth/refresh').send({ refreshToken }).expect(401);
  });

  it('logout-all revokes all tokens', async () => {
    const register = await request(app).post('/api/v1/auth/register').send({ email, password }).expect(201);
    const refreshToken = register.body.refreshToken as string;
    const accessToken = register.body.accessToken as string;

    // issue second token via refresh
    const refreshed = await request(app).post('/api/v1/auth/refresh').send({ refreshToken }).expect(200);

    await request(app)
      .post('/api/v1/auth/logout-all')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    await request(app).post('/api/v1/auth/refresh').send({ refreshToken }).expect(401);
    await request(app).post('/api/v1/auth/refresh').send({ refreshToken: refreshed.body.refreshToken }).expect(401);
  });

  it('prunes expired tokens', async () => {
    const register = await request(app).post('/api/v1/auth/register').send({ email, password }).expect(201);
    const jti = decodeJti(register.body.refreshToken);
    expect(jti).toBeDefined();

    // mark expired
    await RefreshToken.updateMany({}, { expiresAt: new Date(Date.now() - 1000) });
    await pruneExpiredTokens();

    const remaining = await RefreshToken.findOne({ tokenId: jti });
    expect(remaining).toBeNull();
  });
});
