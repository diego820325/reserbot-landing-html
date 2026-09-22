import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// Optional real-SDK check, using downloaded public assets with all traffic intercepted.
test('real SDK masks replay, sanitizes events and stops after withdrawal', async ({ page }) => {
  test.skip(!process.env.POSTHOG_SDK_PATH || !process.env.POSTHOG_RECORDER_PATH,
    'Supply local SDK and lazy-recorder assets; this test never contacts PostHog.');
  const sdk = await readFile(process.env.POSTHOG_SDK_PATH, 'utf8');
  const recorder = await readFile(process.env.POSTHOG_RECORDER_PATH, 'utf8');
  const requests = [];
  page.on('console', message => { if (message.type() === 'error') console.log(message.text()); });
  await page.route('https://**.posthog.com/**', async route => {
    const url = route.request().url();
    requests.push(url);
    if (url.includes('/static/array.js')) return route.fulfill({ contentType: 'text/javascript', body: sdk + `
      window.outgoingEvents = [];
      const originalInit = window.posthog.init.bind(window.posthog);
      window.posthog.init = (token, options) => {
        const beforeSend = options.before_send;
        options.before_send = event => {
          const result = beforeSend(event);
          if (result) window.outgoingEvents.push(JSON.parse(JSON.stringify(result)));
          return result;
        };
        options.disable_compression = true;
        options.opt_out_useragent_filter = true;
        return originalInit(token, options);
      };` });
    if (url.includes('/lazy-recorder.js')) return route.fulfill({ contentType: 'text/javascript', body: recorder });
    if (url.endsWith('/config.js')) return route.fulfill({ contentType: 'text/javascript', body:
      `window._POSTHOG_REMOTE_CONFIG = { 'test-public-token': { config: { sessionRecording: { sampleRate: 1, minimumDurationMilliseconds: 0 }, capturePerformance: false } } };` });
    return route.fulfill({ json: { status: 1, featureFlags: {}, sessionRecording: { sampleRate: 1, minimumDurationMilliseconds: 0 } } });
  });
  await page.route('**/js/analytics-config.js', route => route.fulfill({ contentType: 'text/javascript', body:
    `export const analyticsConfig = { enabled: true, token: 'test-public-token', apiHost: 'https://eu.i.posthog.com' };` }));
  await page.goto('/?utm_source=campaign&email=URL_SECRET#HASH_SECRET');
  await page.locator('#owner-name').fill('PRE_CONSENT_SECRET');
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'Aceptar', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.posthog?.sessionRecordingStarted?.()), { timeout: 15000 }).toBe(true).catch(async error => {
    console.log(requests, await page.evaluate(() => ({ status: window.posthog?.sessionRecording?.status, capturing: window.posthog?.is_capturing?.(), recorded: window.outgoingEvents?.map(e => e.event) })));
    throw error;
  });
  await page.locator('#owner-name').fill('POST_CONSENT_SECRET');
  await page.locator('#email').fill('FORM_SECRET@example.com');
  await page.mouse.move(100, 100);
  await expect.poll(() => page.evaluate(() => window.outgoingEvents.some(e => e.event === '$snapshot')), { timeout: 15000 }).toBe(true);
  const output = await page.evaluate(() => JSON.stringify(window.outgoingEvents));
  expect(output).not.toMatch(/PRE_CONSENT_SECRET|POST_CONSENT_SECRET|FORM_SECRET|URL_SECRET|HASH_SECRET/);
  expect(output).toContain('landing_view');
  expect(output).toContain('trial_form_started');
  expect(output).toContain('ph-no-capture');
  expect(requests.join(' ')).not.toMatch(/URL_SECRET|HASH_SECRET/);
  expect(await page.evaluate(() => document.cookie)).toBe('');
  await page.getByRole('button', { name: 'Preferencias de analítica' }).click();
  await page.getByRole('button', { name: 'Rechazar', exact: true }).click();
  expect(await page.evaluate(() => window.posthog.sessionRecordingStarted())).toBe(false);
  const after = await page.evaluate(() => window.outgoingEvents.length);
  const requestsAfterWithdrawal = requests.length;
  await page.locator('#email').fill('AFTER_WITHDRAWAL@example.com');
  await page.waitForTimeout(3500);
  expect(await page.evaluate(() => window.outgoingEvents.length)).toBe(after);
  expect(requests.length).toBe(requestsAfterWithdrawal);
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key !== 'reserbot.analytics.consent'))).toEqual([]);
});
