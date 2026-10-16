import request from 'supertest';
import { HttpServer } from '../../src/infrastructure/http/server';

describe('default backend isolation', () => {
  it('serves health but never mounts demo identity or documentation routes', async () => {
    const app = new HttpServer({ port: 0, environment: 'test' }).getApp();
    expect((await request(app).get('/health')).status).toBe(200);
    const forged = await request(app).post('/api/users/register').send({
      email: 'root-admin@example.com', name: 'Root',
      password: 'StrongPass123!', role: 'admin',
    });
    expect(forged.status).toBe(404);
    for (const route of ['/api-docs', '/api-docs/', '/api-docs.json']) {
      expect((await request(app).get(route)).status).toBe(404);
    }
  });
});
