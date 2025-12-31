import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import { Card } from '../models/Card';

let mongo: MongoMemoryServer;
const email = 'boarduser@example.com';
const password = 'StrongP@ssw0rd!';

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

const registerAndGetToken = async () => {
  const res = await request(app).post('/api/v1/auth/register').send({ email, password }).expect(201);
  return res.body.accessToken as string;
};

describe('Board and card routes', () => {
  it('creates and lists boards', async () => {
    const token = await registerAndGetToken();

    const createRes = await request(app)
      .post('/api/v1/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Board A' })
      .expect(201);

    expect(createRes.body.board.title).toBe('Board A');

    const listRes = await request(app).get('/api/v1/boards').set('Authorization', `Bearer ${token}`).expect(200);
    expect(listRes.body.boards).toHaveLength(1);
  });

  it('creates, updates, and deletes cards under a board', async () => {
    const token = await registerAndGetToken();
    const { body: boardBody } = await request(app)
      .post('/api/v1/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Board B' })
      .expect(201);

    const boardId = boardBody.board._id as string;

    const createCard = await request(app)
      .post(`/api/v1/boards/${boardId}/cards`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Card 1', description: 'd1' })
      .expect(201);

    const cardId = createCard.body.card._id as string;

    const updateCard = await request(app)
      .patch(`/api/v1/boards/${boardId}/cards/${cardId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'doing' })
      .expect(200);

    expect(updateCard.body.card.status).toBe('doing');

    await request(app)
      .delete(`/api/v1/boards/${boardId}/cards/${cardId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const remaining = await Card.find({ board: boardId });
    expect(remaining).toHaveLength(0);
  });
});
