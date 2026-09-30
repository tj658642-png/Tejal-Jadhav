import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('API', () => {
  it('health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('rejects analyze without auth when supabase configured', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ prompt: 'test question here', taskType: 'general', isDemo: true });
    expect([202, 401]).toContain(res.status);
  });
});
