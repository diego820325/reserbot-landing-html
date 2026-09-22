import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const config = `export const analyticsConfig = { enabled: true, token: 'test-public-token', apiHost: 'https://eu.i.posthog.com' };`;
const sdk = `window.analyticsEvents = []; window.sdkCalls = [];
window.posthog = {
  init(token, options) { window.sdkOptions = options; window.sdkCalls.push('init'); },
  opt_in_capturing() { window.sdkCalls.push('in'); },
  opt_out_capturing() { window.sdkCalls.push('out'); },
  startSessionRecording() { window.sdkCalls.push('start'); },
  stopSessionRecording() { window.sdkCalls.push('stop'); },
  get_session_id() { return 'test-session'; },
  capture(event, properties) {
    const result = window.sdkOptions.before_send({ event, properties });
    if (result) window.analyticsEvents.push(result);
  }
};`;

async function setup(page, { blocked = false } = {}) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/js/analytics-config.js', route => route.fulfill({ contentType: 'text/javascript', body: config }));
  await page.route('https://eu-assets.i.posthog.com/static/array.js', route => blocked ? route.abort() : route.fulfill({ contentType: 'text/javascript', body: sdk }));
}
async function accept(page) {
  await page.getByRole('button', { name: 'Aceptar', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.sdkCalls?.includes('start'))).toBe(true);
}
const events = page => page.evaluate(() => window.analyticsEvents || []);
const names = async page => (await events(page)).map(event => event.event);
async function fill(page) {
  for (const [id, value] of Object.entries({ 'business-name': 'Secret Barber', 'owner-name': 'Secret Owner', email: 'private@example.com', phone: '3001234567', 'business-link': '@private_barber' })) {
    await page.locator(`#${id}`).fill(value);
  }
  await page.locator('#privacy-consent').check();
}

test('no SDK request before acceptance or after rejection; choice survives reload and can be changed', async ({ page }) => {
  await setup(page);
  const requests = [];
  page.on('request', request => { if (request.url().includes('posthog.com')) requests.push(request.url()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Rechazar', exact: true }).click();
  await page.reload();
  await expect(page.locator('.analytics-consent')).toBeHidden();
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'Preferencias de analítica' }).click();
  await accept(page);
  expect(requests).toHaveLength(1);
  await expect.poll(() => names(page)).toContain('landing_view');
  await page.reload();
  await expect.poll(() => names(page)).toContain('landing_view');
  await page.getByRole('button', { name: 'Preferencias de analítica' }).click();
  await page.getByRole('button', { name: 'Rechazar', exact: true }).click();
  expect(await page.evaluate(() => window.sdkCalls.slice(-2))).toEqual(['stop', 'out']);
  await page.reload();
  expect(requests).toHaveLength(2);
});

test('engagement ignores hidden time and milestones require visibility without duplicates', async ({ page }) => {
  await setup(page);
  await page.clock.install();
  await page.goto('/');
  await accept(page);
  await page.evaluate(() => {
    window.testVisible = true;
    Object.defineProperty(document, 'visibilityState', { get: () => window.testVisible ? 'visible' : 'hidden' });
    document.hasFocus = () => true;
  });
  await page.clock.runFor(5000);
  await page.evaluate(() => { window.testVisible = false; document.dispatchEvent(new Event('visibilitychange')); });
  await page.clock.runFor(30000);
  expect(await names(page)).not.toContain('engaged_10s');
  await page.evaluate(() => { window.testVisible = true; document.dispatchEvent(new Event('visibilitychange')); });
  await page.clock.runFor(6000);
  expect((await names(page)).filter(name => name === 'engaged_10s')).toHaveLength(1);
  expect(await names(page)).not.toContain('reached_pricing');
  for (const [id, name] of [['benefits-title', 'reached_benefits'], ['conversation-title', 'reached_differentiation'], ['price-title', 'reached_pricing']]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    await page.clock.runFor(1500);
    expect(await names(page)).toContain(name);
  }
  await page.locator('#benefits-title').scrollIntoViewIfNeeded();
  await page.clock.runFor(2000);
  expect((await names(page)).filter(name => name === 'reached_benefits')).toHaveLength(1);
  expect((await names(page)).filter(name => name === 'hero_passed')).toHaveLength(1);
});

test('real CTA locations and form start have only approved properties', async ({ page }) => {
  await setup(page);
  await page.goto('/?utm_source=campaign&utm_content=video&fbclid=private');
  await accept(page);
  await page.evaluate(() => document.addEventListener('click', event => { if (event.target.closest('a')) event.preventDefault(); }));
  for (const link of await page.locator('a[href="#solicitud"]').all()) await link.click();
  for (const link of await page.locator('a[href="https://demo.reserbot.co"]').all()) await link.click();
  await fill(page);
  await page.locator('#email').fill('changed@example.com');
  const result = await events(page);
  expect(result.filter(e => e.event === 'trial_cta_clicked').map(e => e.properties.location)).toEqual(['navigation', 'hero', 'pricing', 'final_cta']);
  expect(result.filter(e => e.event === 'demo_clicked').map(e => e.properties.location)).toEqual(['hero', 'demo', 'footer']);
  expect(result.filter(e => e.event === 'trial_form_started')).toHaveLength(1);
  expect(JSON.stringify(result)).not.toMatch(/private|Secret|changed@|businessName|field/);
  expect(result.every(e => e.properties.utm_source === 'campaign' && e.properties.first_utm_source === 'campaign')).toBe(true);
});

for (const outcome of ['accepted', 'rejected', 'ambiguous', 'network-error', 'timeout']) {
  test(`trial_submitted requires provider acceptance: ${outcome}`, async ({ page }) => {
    await setup(page);
    if (outcome === 'timeout') await page.clock.install();
    await page.route('https://formspree.io/f/*', async route => {
      if (outcome === 'network-error') return route.abort();
      if (outcome === 'timeout') return;
      await route.fulfill({ status: outcome === 'rejected' ? 429 : 200, contentType: 'application/json',
        body: JSON.stringify(outcome === 'ambiguous' ? {} : { ok: outcome === 'accepted' }) });
    });
    await page.goto('/');
    await accept(page);
    await page.getByRole('button', { name: 'Solicitar prueba gratis' }).click();
    expect(await names(page)).not.toContain('trial_submitted');
    await fill(page);
    await page.getByRole('button', { name: 'Solicitar prueba gratis' }).click();
    if (outcome === 'accepted') {
      await expect(page.locator('#request-success')).toBeVisible();
      expect((await names(page)).filter(name => name === 'trial_submitted')).toHaveLength(1);
    } else {
      if (outcome === 'timeout') await page.clock.runFor(16000);
      await expect(page.locator('#submission-notice')).toContainText('No pudimos enviar');
      expect(await names(page)).not.toContain('trial_submitted');
    }
  });
}

test('blocked SDK cannot break Formspree', async ({ page }) => {
  await setup(page, { blocked: true });
  await page.route('https://formspree.io/f/*', route => route.fulfill({ json: { ok: true } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Aceptar', exact: true }).click();
  await fill(page);
  await page.getByRole('button', { name: 'Solicitar prueba gratis' }).click();
  await expect(page.locator('#request-success')).toBeVisible();
  expect(await names(page)).toEqual([]);
});

test('keyboard consent and privacy preferences remain accessible', async ({ page }) => {
  await setup(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Rechazar', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Preferencias de analítica' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#analytics-consent-title')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Aceptar', exact: true })).toBeFocused();
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  expect(await page.evaluate(async () => (await axe.run()).violations)).toEqual([]);
  await page.goto('/privacidad.html');
  await page.getByRole('button', { name: 'Preferencias de analítica' }).click();
  await expect(page.getByRole('button', { name: 'Rechazar', exact: true })).toBeVisible();
});

test('obsolete consent asks again and withdrawal propagates from the privacy page', async ({ page, context }) => {
  await setup(page);
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('reserbot.analytics.consent', JSON.stringify({ state: 'accepted', consent_version: 'old' })));
  await page.reload();
  await expect(page.getByRole('button', { name: 'Aceptar', exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.posthog)).toBeUndefined();
  await accept(page);
  const privacy = await context.newPage();
  await setup(privacy);
  await privacy.goto('/privacidad.html');
  await privacy.getByRole('button', { name: 'Preferencias de analítica' }).click();
  await privacy.getByRole('button', { name: 'Rechazar', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.sdkCalls.at(-1))).toBe('out');
  await privacy.close();
});

test('failure to load the analytics entry point cannot prevent a successful form submission', async ({ page }) => {
  await page.route('**/js/analytics-bootstrap.js', route => route.abort());
  await page.route('https://formspree.io/f/*', route => route.fulfill({ json: { ok: true } }));
  await page.goto('/');
  await fill(page);
  await page.getByRole('button', { name: 'Solicitar prueba gratis' }).click();
  await expect(page.locator('#request-success')).toBeVisible();
});

test('consent remains usable when persistent storage is unavailable', async ({ page }) => {
  await setup(page);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Unavailable', 'SecurityError'); } });
  });
  await page.goto('/');
  await accept(page);
  await expect(page.locator('.analytics-consent')).toBeHidden();
  await page.reload();
  await expect(page.locator('.analytics-consent')).toBeVisible();
});
