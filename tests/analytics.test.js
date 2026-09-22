import test from 'node:test';
import assert from 'node:assert/strict';
import { readConsent, writeConsent, CONSENT_KEY, CONSENT_VERSION } from '../src/js/consent.js';
import { createAnalytics, createAttribution, readUtms, sanitizeEvent, posthogOptions } from '../src/js/analytics.js';

function memory() {
  return { getItem(key) { return this[key] ?? null; }, setItem(key, value) { this[key] = value; }, removeItem(key) { delete this[key]; } };
}

test('consent persists indefinitely; only a version change invalidates a valid choice', () => {
  const storage = memory();
  assert.equal(readConsent(storage), 'undecided');
  for (const state of ['accepted', 'rejected']) {
    writeConsent(storage, state);
    assert.equal(readConsent(storage), state);
    storage.setItem(CONSENT_KEY, JSON.stringify({ state, consent_version: CONSENT_VERSION, recorded_at: '2000-01-01' }));
    assert.equal(readConsent(storage), state);
  }
  storage.setItem(CONSENT_KEY, JSON.stringify({ state: 'accepted', consent_version: 'old' }));
  assert.equal(readConsent(storage), 'undecided');
  for (const state of ['accepted', 'rejected']) {
    storage.setItem(CONSENT_KEY, JSON.stringify({ state, consent_version: '1' }));
    assert.equal(readConsent(storage), 'undecided');
  }
  storage.setItem(CONSENT_KEY, '{');
  assert.equal(readConsent(storage), 'undecided');
  assert.equal(readConsent(undefined), 'undecided');
  assert.equal(writeConsent(undefined, 'accepted'), false);
});

test('attribution preserves first touch and replaces session touch, including direct arrivals', () => {
  const storage = memory();
  const first = createAttribution(storage, 'https://reserbot.co/?utm_source=one&utm_medium=paid&utm_campaign=launch&utm_content=video&utm_term=barber&fbclid=secret&email=x@y.co');
  assert.equal(first('a').utm_source, 'one');
  assert.equal(first('a').first_utm_source, 'one');
  const second = createAttribution(storage, 'https://reserbot.co/?utm_source=two');
  assert.equal(second('a').utm_source, 'one');
  assert.deepEqual(second('b'), { first_utm_source: 'one', first_utm_medium: 'paid', first_utm_campaign: 'launch', first_utm_content: 'video', first_utm_term: 'barber', utm_source: 'two' });
  const direct = createAttribution(storage, 'https://reserbot.co/');
  assert.equal(direct('c').utm_source, undefined);
  assert.equal(direct('c').first_utm_source, 'one');
  assert.deepEqual(readUtms('https://reserbot.co/?utm_term=x@y.co&fbclid=secret'), {});
  assert.deepEqual(readUtms('https://reserbot.co/?utm_campaign=123456789012'), { utm_campaign: '123456789012' });
});

test('event boundary strips personal data, arbitrary URLs and advertising identifiers', () => {
  const event = { event: 'trial_form_started', properties: { token: 'public', distinct_id: 'anon',
    email: 'x@y.co', field: 'email', value: 'secret', payload: {}, fbclid: 'secret',
    $set: { email: 'secret' }, $referrer: 'https://example.com/?email=secret',
    $current_url: 'https://reserbot.co/?email=secret#secret', utm_source: 'ad' } };
  assert.deepEqual(sanitizeEvent(event, true).properties, { token: 'public', distinct_id: 'anon',
    $current_url: 'https://reserbot.co/', $geoip_disable: true, utm_source: 'ad' });
  assert.equal(sanitizeEvent(event, false), null);
  assert.equal(sanitizeEvent({ event: '$autocapture' }, true), null);
  const options = posthogOptions(() => false);
  assert.equal(options.autocapture, false);
  assert.equal(options.session_recording.maskAllInputs, true);
  assert.equal(options.session_recording.blockSelector, '#trial-form');
  assert.equal(options.session_recording.maskCapturedNetworkRequestFn({ name: 'https://reserbot.co/?secret=1' }).name, 'https://reserbot.co/');
});

const config = { enabled: true, token: 'test', apiHost: 'https://eu.i.posthog.com' };
function sdkMock() {
  const events = [];
  return { events, init() {}, opt_in_capturing() {}, startSessionRecording() {}, stopSessionRecording() {},
    opt_out_capturing() {}, get_session_id: () => 'session', capture: (name, properties) => events.push({ name, properties }) };
}

test('loading and capture are consent gated, deduplicated and isolated from form data', async () => {
  const sdk = sdkMock();
  let loads = 0;
  const analytics = createAnalytics(config, { storage: memory(), url: () => 'https://reserbot.co/', load: async () => { loads++; return sdk; } });
  analytics.capture('trial_submitted');
  await analytics.setConsent('rejected');
  assert.equal(loads, 0);
  await analytics.setConsent('accepted');
  analytics.capture('trial_form_started', { field: 'email', value: 'secret' }, true);
  analytics.capture('trial_form_started', {}, true);
  assert.deepEqual(sdk.events, [{ name: 'trial_form_started', properties: {} }]);
  await analytics.setConsent('rejected');
  analytics.capture('trial_submitted');
  assert.equal(sdk.events.length, 1);
});

test('revocation while SDK loads prevents late initialization and queued event delivery', async () => {
  const sdk = sdkMock();
  let initialized = false;
  sdk.init = () => { initialized = true; };
  let finish;
  const analytics = createAnalytics(config, { storage: memory(), url: () => 'https://reserbot.co/', load: () => new Promise(resolve => { finish = resolve; }) });
  const pending = analytics.setConsent('accepted');
  analytics.capture('landing_view');
  await analytics.setConsent('rejected');
  finish(sdk);
  await pending;
  assert.equal(initialized, false);
  assert.deepEqual(sdk.events, []);
});

test('disabled config and failed SDK never throw or transmit', async () => {
  let loads = 0;
  const analytics = createAnalytics({ ...config, enabled: false }, { load: async () => { loads++; } });
  await analytics.setConsent('accepted');
  assert.equal(loads, 0);
  const failing = createAnalytics(config, { url: () => 'https://reserbot.co/', load: async () => { throw Error('blocked'); } });
  await failing.setConsent('accepted');
  assert.doesNotThrow(() => failing.capture('trial_submitted'));
});
