import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const base = process.env.SMOKE_BASE_URL || 'http://localhost:3100';
const executablePath = [
  process.env.SMOKE_BROWSER_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((value) => value && existsSync(value));
const browser = await puppeteer.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
try {
  const page = await browser.newPage();
  await page.setBypassServiceWorker(true);
  const errors = [];
  const failedLocalRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.url().startsWith(base) && response.status() >= 400) failedLocalRequests.push(`${response.status()} ${response.url()}`);
  });
  // Isolate visual checks from live database records and third-party integrations.
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = new URL(req.url());
    const fixtures = {
      '/api/public/stats': { unitsShortage: 0, unitsCollected: 0, annualSupply: 0, livesSaved: 0, campsDeployed: 0 },
      '/api/disaster': { activeAlert: null },
      '/api/sos': [], '/api/leaderboard': [], '/api/bloodbanks': [], '/api/requests': [],
    };
    if (url.origin === base && Object.hasOwn(fixtures, url.pathname)) {
      return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(fixtures[url.pathname]) });
    }
    if (url.hostname === 'checkout.razorpay.com') return req.abort();
    return req.continue();
  });
  for (const route of ['/', '/login', '/register', '/about', '/faq', '/donate', '/request', '/donate-money', '/verify']) {
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle0', timeout: 45000 });
    assert.equal(response.status(), 200, route);
    assert.ok((await page.$eval('body', (body) => body.innerText)).length > 50, route);
    console.log(`PASS ${route}`);
  }
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(`${base}/register`, { waitUntil: 'networkidle0' });
  assert.equal(await page.$eval('select[name="role"]', (select) => [...select.options].some((option) => ['admin', 'hospital'].includes(option.value))), false);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert.equal(overflow, false, 'mobile registration should not overflow horizontally');
  assert.deepEqual(errors, [], 'browser runtime errors');
  assert.deepEqual(failedLocalRequests, [], 'failed local page or asset requests');
  console.log('PASS mobile registration, browser runtime, and local assets');
} finally {
  await browser.close();
}
