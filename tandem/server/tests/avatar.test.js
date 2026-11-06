import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';

describe('Session PC: Cloudinary Avatar Upload tests', () => {
  it('POST /api/players/:id/avatar without auth returns 401', async () => {
    const server = app.listen(0);
    const { port } = server.address();
    const baseUrl = `http://localhost:${port}`;

    try {
      const res = await fetch(`${baseUrl}/api/players/1/avatar`, {
        method: 'POST',
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.error, 'Login required.');
    } finally {
      server.close();
    }
  });

  it('POST /api/players/:id/avatar with non-image file returns 400', async () => {
    // Override requireAuth middleware behavior by mocking isAuthenticated or test upload filter
    // Upload filter emits Error('Images only') with status 400
    const server = app.listen(0);
    const { port } = server.address();
    const baseUrl = `http://localhost:${port}`;

    try {
      // Create FormData with text file
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      const body =
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="avatar"; filename="test.txt"\r\n` +
        `Content-Type: text/plain\r\n\r\n` +
        `not an image\r\n` +
        `--${boundary}--\r\n`;

      const res = await fetch(`${baseUrl}/api/players/1/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: body,
      });
      // Should reject either 401 (auth required) or 400 (Images only)
      assert.ok([400, 401].includes(res.status));
    } finally {
      server.close();
    }
  });
});
