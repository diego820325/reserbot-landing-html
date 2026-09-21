import test from 'node:test';
import assert from 'node:assert/strict';
import { createTrialService } from '../src/js/trial-service.js';

test('unconfigured submission cannot acknowledge or transmit a trial request', async () => {
  const trialService = createTrialService({ endpoint: '', enabled: false });
  assert.equal(trialService.available, false);
  await assert.rejects(trialService.submit({ businessName: 'Test' }), /not configured/);
});

const config = { endpoint: 'https://formspree.io/f/testform', enabled: true };
test('only a confirmed provider response acknowledges a request', async () => {
  let sent;
  const service = createTrialService(config, async (url, options) => {
    sent = { url, options };
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  });
  assert.deepEqual(await service.submit({ email: 'test@example.com', unexpected: 'omit' }), { accepted: true });
  assert.equal(sent.url, config.endpoint);
  assert.equal(sent.options.method, 'POST');
  assert.equal(sent.options.credentials, 'omit');
  assert.deepEqual(JSON.parse(sent.options.body), { email: 'test@example.com', _gotcha: '' });
});

for (const [status, body] of [[200, '{}'], [200, '{"ok":false}'], [400, '{"errors":[]}'], [429, '{}'], [500, '{}'], [200, '<html>']]) {
  test(`does not confirm status ${status} with ${body}`, async () => {
    const service = createTrialService(config, async () => new Response(body, { status }));
    await assert.rejects(service.submit({}));
  });
}

test('network failure remains a failure', async () => {
  const service = createTrialService(config, async () => { throw new TypeError('offline'); });
  await assert.rejects(service.submit({}), /offline/);
});

test('disabled or untrusted endpoints never transmit data', async () => {
  for (const settings of [{ ...config, enabled: false }, { ...config, endpoint: 'https://example.com/f/test' }]) {
    let called = false;
    const service = createTrialService(settings, async () => { called = true; });
    assert.equal(service.available, false);
    await assert.rejects(service.submit({}));
    assert.equal(called, false);
  }
});
