import request from 'supertest';
import app from '../app';

describe('GET /', () => {
  it('returns the health message', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toBe('GRIMOIRE Backend is running!');
  });
});
