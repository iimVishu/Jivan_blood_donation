const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { createHmac, generateKeyPairSync, sign } = require('node:crypto');
const ts = require('typescript');

// Exercise real route handlers with isolated service mocks; no emails, payments or database writes.
function load(entry, overrides = {}, env = {}) {
  const cache = new Map();
  const mocks = {
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    'next-auth': { getServerSession: async () => null },
    '@/lib/auth': { authOptions: {} },
    '@/lib/db': async () => {},
    ...overrides,
  };
  function read(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const loadedModule = { exports: {} };
    cache.set(file, loadedModule);
    const localRequire = createRequire(file);
    const requireMock = (name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith('@/')) return read(path.resolve(__dirname, '../src', name.slice(2) + '.ts'));
      return localRequire(name);
    };
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(code, {
      module: loadedModule, exports: loadedModule.exports, require: requireMock, Buffer, Date, URL, Request, Response,
      SyntaxError, AbortSignal, process: { env: { ...env } },
      console: { log() {}, info() {}, warn() {}, error() {} },
    }, { filename: file });
    return loadedModule.exports;
  }
  return read(path.resolve(__dirname, '../src', entry));
}

const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const bankId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const donorId = 'cccccccccccccccccccccccc';
const request = (body) => new Request('http://localhost/api/test', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
const params = { params: Promise.resolve({ id }) };
const session = (role, userId = donorId) => ({ getServerSession: async () => ({ user: { id: userId, role } }) });
const query = (value) => ({ select() { return this; }, session() { return this; }, populate() { return this; }, then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); } });

test('registration rejects privileged roles and malformed input before querying MongoDB', async () => {
  const route = load('app/api/register/route.ts', { '@/models/User': {}, '@/lib/email': { sendEmail: async () => {} } });
  for (const role of ['admin', 'hospital']) {
    const response = await route.POST(request({ name: 'Test', email: 'test@example.com', password: 'test1234', role }));
    assert.equal(response.status, 403);
  }
  assert.equal((await route.POST(request({}))).status, 400);
});

test('registration sends OTP through the shared SMTP service', async () => {
  let sent;
  const route = load('app/api/register/route.ts', {
    '@/models/User': { findOne: async () => null, create: async () => {} },
    '@/lib/email': { sendEmail: async (...args) => { sent = args; } },
  });
  assert.equal((await route.POST(request({ name: 'Test', email: ' TEST@example.com ', password: 'test1234' }))).status, 201);
  assert.equal(sent[0], 'test@example.com');
  assert.match(sent[2], /\d{6}/);
});

test('OTP verification cannot accept a missing OTP', async () => {
  const route = load('app/api/register/verify/route.ts', { '@/models/User': {} });
  assert.equal((await route.POST(request({ email: 'test@example.com' }))).status, 400);
});

test('profile edits exclude staff assignments, counters and verification tokens', async () => {
  let update;
  let projection;
  const route = load('app/api/profile/route.ts', {
    'next-auth': session('donor'),
    '@/models/User': { findByIdAndUpdate: (_id, body) => {
      update = body;
      return { select: (fields) => { projection = fields; return Promise.resolve({ name: 'Updated' }); } };
    } },
  });
  const response = await route.PUT(request({ name: 'Updated', role: 'admin', hospitalIds: [bankId], donationCount: 100, otp: '123456', isVerified: true, $inc: { points: 500 } }));
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(JSON.stringify(update)), { $set: { name: 'Updated' } });
  assert.match(projection, /-otp/);
  assert.match(projection, /-resetPasswordToken/);
});

function appointmentRoute(role, appointmentDonor = donorId, overrides = {}) {
  return load('app/api/appointments/[id]/route.ts', {
    'next-auth': session(role),
    '@/models/Appointment': { findById: () => query({ donor: appointmentDonor, bloodBank: bankId, status: 'pending' }) },
    '@/models/User': { findById: async () => ({ role, hospitalIds: [] }) },
    '@/models/BloodBank': { findById: () => query({ admins: [] }) },
    '@/lib/appointment-workflow': { updateAppointmentWorkflow: async () => ({ status: 'cancelled' }) },
    ...overrides,
  });
}

test('donor can cancel own appointment but cannot edit health data or another donor appointment', async () => {
  const route = appointmentRoute('donor');
  assert.equal((await route.PUT(request({ status: 'cancelled' }), params)).status, 200);
  assert.equal((await route.PUT(request({ status: 'completed' }), params)).status, 403);
  assert.equal((await route.PUT(request({ healthStats: { weight: '70' } }), params)).status, 403);
  assert.equal((await appointmentRoute('donor', id).PUT(request({ status: 'cancelled' }), params)).status, 403);
});

test('recipient and unrelated hospital cannot modify appointments', async () => {
  for (const role of ['recipient', 'hospital']) {
    assert.equal((await appointmentRoute(role).PUT(request({ status: 'completed' }), params)).status, 403);
  }
});

test('assigned hospital can update its appointment and malformed IDs return 400', async () => {
  const route = appointmentRoute('hospital', donorId, { '@/models/User': { findById: async () => ({ role: 'hospital', hospitalIds: [bankId] }) } });
  assert.equal((await route.PUT(request({ status: 'confirmed' }), params)).status, 200);
  assert.equal((await route.PUT(request({ status: 'confirmed' }), { params: Promise.resolve({ id: 'invalid' }) })).status, 400);
});

test('request updates reject another recipient and never reassign requester', async () => {
  const route = load('app/api/requests/[id]/route.ts', {
    'next-auth': session('recipient'), '@/models/AuditLog': {},
    '@/models/Request': { findById: async () => ({ requester: id, status: 'pending' }) },
  });
  assert.equal((await route.PUT(request({ patientName: 'Changed' }), params)).status, 403);
  let saved;
  const ownerRoute = load('app/api/requests/[id]/route.ts', {
    'next-auth': session('recipient'), '@/models/AuditLog': {},
    '@/models/Request': { findById: async () => ({ requester: donorId, status: 'pending' }), findByIdAndUpdate: async (_id, update) => { saved = update; return { status: 'pending' }; } },
  });
  assert.equal((await ownerRoute.PUT(request({ patientName: 'Changed', requester: id, fulfilledBy: bankId }), params)).status, 200);
  assert.deepEqual(JSON.parse(JSON.stringify(saved)), { $set: { patientName: 'Changed' } });
});

test('payment creation rejects invalid amounts and never simulates a successful donation', async () => {
  const route = load('app/api/create-payment-intent/route.ts', { '@/models/MoneyDonation': {} });
  for (const amount of [-1, 0, 49, '100', 50.001, null]) {
    assert.equal((await route.POST(request({ amount, email: 'test@example.com' }))).status, 400);
  }
  const response = await route.POST(request({ amount: 100, email: 'test@example.com' }));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).isMock, undefined);
});

test('payment verification rejects forged signatures, uncaptured payments and amount mismatches', async () => {
  const orderId = 'order_test123';
  const paymentId = 'pay_test123';
  const signature = createHmac('sha256', 'secret').update(`${orderId}|${paymentId}`).digest('hex');
  const donation = { orderId, amount: 10000, currency: 'INR' };
  let fetched = 0;
  let payment = { order_id: orderId, amount: 10000, currency: 'INR', status: 'authorized' };
  const route = load('app/api/donate-money/success/route.ts', {
    '@/models/MoneyDonation': { findOne: async () => donation }, '@/lib/email': {},
    razorpay: class { payments = { fetch: async () => { fetched++; return payment; } }; },
  }, { NEXT_PUBLIC_RAZORPAY_KEY_ID: 'key', RAZORPAY_KEY_SECRET: 'secret' });
  assert.equal((await route.POST(request({ orderId, paymentId, signature: '0'.repeat(64) }))).status, 400);
  assert.equal(fetched, 0);
  assert.equal((await route.POST(request({ orderId, paymentId, signature }))).status, 409);
  payment = { ...payment, status: 'captured', amount: 5000 };
  assert.equal((await route.POST(request({ orderId, paymentId, signature }))).status, 409);
});

test('verified payment uses stored receipt data and repeated callbacks send one receipt', async () => {
  const orderId = 'order_test123';
  const paymentId = 'pay_test123';
  const signature = createHmac('sha256', 'secret').update(`${orderId}|${paymentId}`).digest('hex');
  const donation = { orderId, amount: 10000, currency: 'INR', email: 'stored@example.com' };
  let claimed = false;
  const receipts = [];
  const route = load('app/api/donate-money/success/route.ts', {
    '@/models/MoneyDonation': { findOne: async () => donation, updateOne: async () => {}, findOneAndUpdate: async () => { if (claimed) return null; claimed = true; return donation; } },
    '@/lib/email': { sendDonationThankYouEmail: async (...args) => receipts.push(args) },
    razorpay: class { payments = { fetch: async () => ({ order_id: orderId, amount: 10000, currency: 'INR', status: 'captured' }) }; },
  }, { NEXT_PUBLIC_RAZORPAY_KEY_ID: 'key', RAZORPAY_KEY_SECRET: 'secret' });
  for (let i = 0; i < 2; i++) assert.equal((await route.POST(request({ orderId, paymentId, signature, amount: 9999, email: 'forged@example.com' }))).status, 200);
  assert.deepEqual(receipts, [['stored@example.com', 100, paymentId]]);
});

test('public configuration and seed routes refuse unauthorized access', async () => {
  const config = load('app/api/test-config/route.ts', { '@/lib/email': {} });
  assert.equal((await config.GET()).status, 403);
  const seed = load('app/api/seed/route.ts', { '@/models/User': {}, '@/models/BloodBank': {} }, { NODE_ENV: 'production', ENABLE_DEV_SEED: 'true' });
  assert.equal((await seed.GET()).status, 404);
});

test('Discord reschedule button opens its modal after signature and admin checks', async () => {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const hex = publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex');
  const route = load('app/api/discord/interactions/route.ts', { '@/lib/appointment-workflow': {} }, {
    DISCORD_PUBLIC_KEY: hex, DISCORD_ADMIN_USER_IDS: '123', DISCORD_ADMIN_MONGODB_USER_ID: donorId,
  });
  const body = JSON.stringify({ type: 3, member: { user: { id: '123' } }, data: { custom_id: `appointment:${id}:reschedule` } });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = sign(null, Buffer.from(timestamp + body), privateKey).toString('hex');
  const response = await route.POST(new Request('http://localhost/api/discord', { method: 'POST', body, headers: { 'x-signature-ed25519': signature, 'x-signature-timestamp': timestamp } }));
  assert.equal((await response.json()).type, 9);
});

test('completed donation cannot be reopened and credited twice', async () => {
  const workflow = load('lib/appointment-workflow.ts', {
    mongoose: {}, '@/lib/email': {}, '@/lib/discord': {}, '@/models/AuditLog': {}, '@/models/BloodBank': {},
    '@/models/Appointment': { findById: async () => ({ status: 'completed' }) },
    '@/models/User': { findById: () => query({ role: 'admin' }) },
  });
  await assert.rejects(workflow.updateAppointmentWorkflow({ id, performedBy: donorId, performedByRole: 'admin', status: 'pending' }), /cannot be reopened/);
});

test('completing and retrying a donation credits stock and donor totals once', async () => {
  let state = { _id: id, status: 'confirmed', donor: donorId, bloodBank: bankId, date: new Date() };
  let stock = 0;
  let donations = 0;
  let ended = 0;
  const document = () => ({ ...state, populate: async function () { this.donor = { name: 'Donor', bloodGroup: 'O+' }; this.bloodBank = { name: 'Bank' }; } });
  const workflow = load('lib/appointment-workflow.ts', {
    mongoose: { startSession: async () => ({ withTransaction: async (fn) => fn(), endSession: async () => { ended++; } }) },
    '@/lib/email': {}, '@/lib/discord': {}, '@/models/AuditLog': { create: async () => {} },
    '@/models/Appointment': {
      findById: async () => document(),
      findOneAndUpdate: async (_filter, update) => { state = { ...state, ...update.$set }; return document(); },
    },
    '@/models/User': { findById: (value) => query(value === donorId ? { bloodGroup: 'O+' } : { role: 'admin' }), findByIdAndUpdate: async () => { donations++; } },
    '@/models/BloodBank': { findByIdAndUpdate: async () => { stock++; return {}; } },
  });
  const update = { id, performedBy: bankId, performedByRole: 'admin', status: 'completed', notifyDiscord: false };
  await workflow.updateAppointmentWorkflow(update);
  await workflow.updateAppointmentWorkflow(update);
  assert.equal(stock, 1);
  assert.equal(donations, 1);
  assert.equal(ended, 1);
});

test('service worker never intercepts API, account data, or RSC fetches for caching', () => {
  const events = {};
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../public/sw.js'), 'utf8'), {
    self: { addEventListener: (name, callback) => { events[name] = callback; }, location: { origin: 'http://localhost' }, skipWaiting() {} }, URL,
  });
  for (const pathname of ['/api/profile', '/dashboard/donor?_rsc=123', '/api/auth/session', '/login']) {
    let intercepted = false;
    events.fetch({ request: { method: 'GET', url: `http://localhost${pathname}`, mode: 'cors' }, respondWith: () => { intercepted = true; } });
    assert.equal(intercepted, false, pathname);
  }
});

test('Google sign-in rejects unverified emails and replaces an unverified account password', async () => {
  const pendingUser = { isVerified: false, password: 'pre-registered-password', otp: '123456', save: async () => {} };
  const auth = load('lib/auth.ts', {
    'next-auth/providers/google': (options) => options,
    'next-auth/providers/credentials': (options) => options,
    '@/models/User': { findOne: async () => pendingUser },
  });
  const input = { user: { email: 'test@example.com' }, account: { provider: 'google' }, profile: { email_verified: false } };
  assert.equal(await auth.authOptions.callbacks.signIn(input), false);
  input.profile.email_verified = true;
  assert.equal(await auth.authOptions.callbacks.signIn(input), true);
  assert.notEqual(pendingUser.password, 'pre-registered-password');
  assert.equal(pendingUser.provider, 'google');
  assert.equal(pendingUser.otp, undefined);
});

test('Discord acknowledges slow appointment changes before running background work', async () => {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const callbacks = [];
  const route = load('app/api/discord/interactions/route.ts', {
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) }, after: (fn) => callbacks.push(fn) },
    '@/lib/appointment-workflow': { updateAppointmentWorkflow: () => { throw new Error('Should run after response'); } },
  }, {
    DISCORD_PUBLIC_KEY: publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex'),
    DISCORD_ADMIN_USER_IDS: '123', DISCORD_ADMIN_MONGODB_USER_ID: donorId,
  });
  const body = JSON.stringify({ type: 3, application_id: '456', token: 'test-token', member: { user: { id: '123' } }, data: { custom_id: `appointment:${id}:confirm` } });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = sign(null, Buffer.from(timestamp + body), privateKey).toString('hex');
  const response = await route.POST(new Request('http://localhost/api/discord', { method: 'POST', body, headers: { 'x-signature-ed25519': signature, 'x-signature-timestamp': timestamp } }));
  assert.equal((await response.json()).type, 5);
  assert.equal(callbacks.length, 1);
});
