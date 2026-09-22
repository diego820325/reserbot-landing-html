import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { analyticsConfig } from '../src/js/analytics-config.js';
import { CONSENT_VERSION } from '../src/js/consent.js';
import { createTrialService } from '../src/js/trial-service.js';

test('new submissions reference the displayed notice without coupling analytics consent', async () => {
  const notice = await readFile(new URL('../src/privacidad.html', import.meta.url), 'utf8');
  let payload;
  const service = createTrialService({ enabled: true, endpoint: 'https://formspree.io/f/test' }, async (_, options) => {
    payload = JSON.parse(options.body);
    return new Response('{"ok":true}');
  });
  await service.submit({ privacyConsent: 'accepted' });
  assert.ok(notice.includes(`Versión: ${payload.privacyVersion}.`));
  assert.equal(CONSENT_VERSION, '2');
  assert.notEqual(CONSENT_VERSION, payload.privacyVersion);
  assert.equal(payload.consent_version, undefined);
});

test('production analytics uses the approved EU public project', () => {
  assert.equal(analyticsConfig.enabled, true);
  assert.equal(analyticsConfig.token, 'phc_ovTQvGHwmCFmvnDGmdksYtZQkCygmwkeDFah5H37H7hJ');
  assert.equal(analyticsConfig.apiHost, 'https://eu.i.posthog.com');
});
