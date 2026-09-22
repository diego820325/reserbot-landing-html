import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

for (const width of [320, 390, 768, 1440]) {
  test(`accessible layout without overflow at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    for (const name of ['Aceptar', 'Rechazar']) {
      await expect(page.getByRole('button', { name, exact: true })).toBeInViewport();
    }
    await expect(page.locator('.analytics-consent a')).toBeInViewport();
    await expect(page.locator('.analytics-consent a')).toHaveAttribute('href', './privacidad.html');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const heroBounds = await page.locator('section[aria-labelledby="hero-title"]').boundingBox();
    const conversationBounds = await page.locator('#como-funciona > div').boundingBox();
    expect(conversationBounds.x).toBeGreaterThanOrEqual(24);
    expect(conversationBounds.x).toBeCloseTo(heroBounds.x, 0);
    expect(conversationBounds.width).toBeCloseTo(heroBounds.width, 0);
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => (await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    })).violations);
    expect(violations).toEqual([]);
    await page.screenshot({ path: `test-results/consent-${width}.png` });
    await page.screenshot({ path: `test-results/website-${width}.png`, fullPage: true });
  });
}

test('disabled collection never sends or displays success, with or without JavaScript', async ({ browser }) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ javaScriptEnabled });
    const page = await context.newPage();
    await page.route('**/js/trial-config.js', route => route.fulfill({ contentType: 'text/javascript', body: 'export const trialConfig = { enabled: false, endpoint: \"\" };' }));
    const posts = [];
    page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()); });
    await page.goto('http://127.0.0.1:4173');
    await expect(page.getByLabel('Nombre de la barbería', { exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Solicitar prueba gratis' })).toBeDisabled();
    await expect(page.locator('#request-success')).toBeHidden();
    expect(posts).toEqual([]);
    await context.close();
  }
});

async function fillRequest(page) {
  await page.getByLabel('Nombre de la barbería', { exact: true }).fill('Barbería de prueba');
  await page.getByLabel('Tu nombre', { exact: true }).fill('Persona de prueba');
  await page.getByLabel('Correo electrónico').fill('test@example.com');
  await page.getByLabel('Celular / WhatsApp').fill('3001234567');
  await page.getByLabel('Instagram, página web').fill('@barberia_prueba');
  await page.getByRole('checkbox').check();
}

for (const outcome of ['accepted', 'rejected', 'network-error']) {
  test(`connected UI handles ${outcome} without false confirmation`, async ({ page }) => {
    // Exercise the real adapter while intercepting external traffic.
    await page.route('https://formspree.io/f/mqpaqeqb', async route => {
      if (outcome === 'network-error') return route.abort();
      expect(route.request().postDataJSON().businessName).toBe('Barbería de prueba');
      await route.fulfill({ status: outcome === 'accepted' ? 200 : 429,
        contentType: 'application/json', body: JSON.stringify({ ok: outcome === 'accepted' }) });
    });
    await page.goto('/');
    await fillRequest(page);
    await page.getByRole('button', { name: 'Solicitar prueba gratis' }).click();
    if (outcome === 'accepted') {
      await expect(page.locator('#request-success')).toBeVisible();
      await expect(page.locator('#request-success')).toBeFocused();
      await expect(page.locator('#trial-form')).toBeHidden();
    } else {
      await expect(page.locator('#request-success')).toBeHidden();
      await expect(page.locator('#submission-notice')).toContainText('No pudimos enviar');
      await expect(page.getByRole('button', { name: 'Solicitar prueba gratis' })).toBeEnabled();
    }
  });
}

test('keyboard skip link, reduced motion, demo links and local assets', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Ir al contenido' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contenido$/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  const externalLinks = await page.locator('a[href^="https:"]').evaluateAll(links => links.map(link => link.href));
  expect(externalLinks.length).toBeGreaterThan(0);
  expect(externalLinks.every(link => link === 'https://demo.reserbot.co/')).toBe(true);
  expect(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  expect(errors).toEqual([]);
});

test('privacy page and explicit authorization', async ({ page }) => {
  let posts = 0;
  await page.route('https://formspree.io/f/*', route => { posts++; return route.abort(); });
  await page.goto('/');
  await fillRequest(page);
  await page.getByRole('checkbox').uncheck();
  await page.getByRole('button', { name: 'Solicitar prueba gratis' }).click();
  expect(posts).toBe(0);
  await expect(page.locator('#request-success')).toBeHidden();
  await page.goto('/privacidad.html');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('privacidad');
  await expect(page.locator('main')).toContainText('Diego Mario Garcia Medellin');
  await expect(page.locator('main')).toContainText('Versión: 2026-09-22');
  await expect(page.getByRole('heading', { name: 'Analítica del sitio' })).toBeVisible();
  await expect(page.locator('section[aria-labelledby="analytics-title"]')).toContainText('1 año');
  await expect(page.locator('section[aria-labelledby="analytics-title"]')).toContainText('30 días');
  await expect(page.getByRole('link', { name: 'política de privacidad de PostHog' })).toHaveAttribute('href', 'https://posthog.com/privacy');
  await expect(page.locator('main')).not.toContainText('pendiente de aprobación');
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  expect(await page.evaluate(async () => (await axe.run()).violations)).toEqual([]);
});
