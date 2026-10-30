const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { io } = require('socket.io-client');

test('notification service requires its private token and delivers valid broadcasts', { timeout: 45000 }, async (t) => {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: '0', MONGODB_URI: '', NOTIFICATION_API_TOKEN: 'integration-test-token', FRONTEND_URL: 'http://localhost:3000' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => child.kill());
  const port = await new Promise((resolve, reject) => {
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    const timer = setTimeout(() => reject(new Error(`Backend did not start: ${stderr}`)), 30000);
    child.once('error', reject);
    child.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Backend exited (${code}): ${stderr}`)); });
    child.stdout.on('data', (chunk) => {
      const match = chunk.toString().match(/running on port (\d+)/);
      if (match) { clearTimeout(timer); resolve(Number(match[1])); }
    });
  });
  const base = `http://localhost:${port}`;
  const send = (body, token) => fetch(`${base}/api/notify`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
  });
  assert.equal((await fetch(`${base}/api/health`)).status, 200);
  assert.equal((await send({ title: 'Test', message: 'Test' })).status, 401);
  assert.equal((await send({ title: 'Test' }, 'integration-test-token')).status, 400);
  const socket = io(base, { transports: ['websocket'], reconnection: false });
  t.after(() => socket.disconnect());
  await new Promise((resolve, reject) => { socket.once('connect', resolve); socket.once('connect_error', reject); });
  const event = new Promise((resolve) => socket.once('new_notification', resolve));
  assert.equal((await send({ title: 'Test', message: 'Delivered', type: 'info' }, 'integration-test-token')).status, 200);
  const notification = await event;
  assert.equal(notification.title, 'Test');
  assert.equal(notification.message, 'Delivered');
});
