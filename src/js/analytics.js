export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
export const FIRST_TOUCH_KEY = 'reserbot.analytics.first-touch';
export const SESSION_TOUCH_KEY = 'reserbot.analytics.session-touch';
export const EVENTS = new Set(['landing_view', 'engaged_10s', 'hero_passed', 'reached_benefits',
  'reached_differentiation', 'reached_pricing', 'demo_clicked', 'trial_cta_clicked',
  'trial_form_started', 'trial_submitted']);
const LOCATIONS = {
  demo_clicked: ['hero', 'demo', 'footer', 'submission_notice'],
  trial_cta_clicked: ['navigation', 'hero', 'pricing', 'final_cta'],
};

export function readUtms(url) {
  const params = new URL(url).searchParams;
  return Object.fromEntries(UTM_KEYS.flatMap(key => {
    const value = params.get(key);
    // Campaign labels only; reject obvious contact data and excessive input.
    return value && value.length <= 200 && !/@|https?:|\+\d[\d ().-]{6,}/i.test(value)
      ? [[key, value]] : [];
  }));
}

export function cleanUrl(value) {
  try { const url = new URL(value); return `${url.origin}${url.pathname}`; }
  catch { return ''; }
}

const safeRead = (storage, key) => {
  try { return JSON.parse(storage.getItem(key)); } catch { return null; }
};
const safeWrite = (storage, key, value) => {
  try { storage.setItem(key, JSON.stringify(value)); } catch { /* Memory remains usable. */ }
};

export function createAttribution(storage, url) {
  const arrival = readUtms(url);
  let first = safeRead(storage, FIRST_TOUCH_KEY);
  if (!first || typeof first !== 'object') {
    first = arrival;
    safeWrite(storage, FIRST_TOUCH_KEY, first);
  }
  let session = safeRead(storage, SESSION_TOUCH_KEY);
  return sessionId => {
    if (!session || session.id !== sessionId) {
      session = { id: sessionId, utms: arrival };
      safeWrite(storage, SESSION_TOUCH_KEY, session);
    }
    const properties = {};
    for (const [prefix, touch] of [['first_', first], ['', session.utms]]) {
      for (const key of UTM_KEYS) {
        const value = touch?.[key];
        if (typeof value === 'string' && readUtms(`https://reserbot.co/?${new URLSearchParams({ [key]: value })}`)[key]) {
          properties[`${prefix}${key}`] = value;
        }
      }
    }
    return properties;
  };
}

export function sanitizeEvent(event, allowed) {
  if (!allowed) return null;
  // Replay has a separate schema; masking must happen in rrweb before serialization.
  if (event.event === '$snapshot') return event;
  if (!EVENTS.has(event.event)) return null;
  const source = event.properties || {};
  const properties = {};
  for (const key of ['token', 'distinct_id', '$device_id', '$session_id', '$window_id', '$lib', '$lib_version',
    '$browser', '$browser_version', '$os', '$device_type', '$viewport_width', '$viewport_height',
    '$is_identified', '$process_person_profile']) {
    if (source[key] !== undefined) properties[key] = source[key];
  }
  properties.$current_url = cleanUrl(source.$current_url);
  properties.$geoip_disable = true;
  if (LOCATIONS[event.event]?.includes(source.location)) properties.location = source.location;
  for (const prefix of ['', 'first_']) {
    for (const key of UTM_KEYS) {
      const value = source[`${prefix}${key}`];
      if (typeof value === 'string' && readUtms(`https://reserbot.co/?${new URLSearchParams({ [key]: value })}`)[key]) {
        properties[`${prefix}${key}`] = value;
      }
    }
  }
  return { ...event, properties };
}

export function posthogOptions(isAllowed) {
  return {
    api_host: 'https://eu.i.posthog.com', defaults: '2026-05-30',
    persistence: 'localStorage', persistence_name: 'reserbot_analytics',
    persistence_save_debounce_ms: 0, cross_subdomain_cookie: false,
    opt_out_capturing_by_default: true, opt_out_persistence_by_default: true,
    opt_out_capturing_cookie_prefix: 'reserbot.analytics.sdk-consent',
    person_profiles: 'never', autocapture: false, capture_pageview: false, capture_pageleave: false,
    capture_dead_clicks: false, rageclick: false, capture_heatmaps: false,
    capture_exceptions: false, capture_performance: false, enable_recording_console_log: false,
    disable_surveys: true, opt_in_site_apps: false, disable_session_recording: true,
    save_campaign_params: false, save_referrer: false, disable_scroll_properties: true,
    advanced_disable_feature_flags: true, debug: false,
    session_recording: {
      maskAllInputs: true, blockClass: 'ph-no-capture', blockSelector: '#trial-form',
      maskTextSelector: '#trial-form', recordCrossOriginIframes: false,
      recordCanvas: false,
      recordHeaders: false, recordBody: false, streamNetworkBody: false,
      collectFonts: false, captureJsonLd: false,
      maskCapturedNetworkRequestFn: request => ({ ...request, name: cleanUrl(request.name) }),
    },
    before_send: event => sanitizeEvent(event, isAllowed()),
  };
}

let sdkLoad;
export function loadPosthog() {
  if (!sdkLoad) sdkLoad = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://eu-assets.i.posthog.com/static/array.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer';
    const timeout = setTimeout(() => reject(new Error('Analytics unavailable')), 10000);
    script.onload = () => { clearTimeout(timeout); resolve(window.posthog); };
    script.onerror = () => { clearTimeout(timeout); reject(new Error('Analytics unavailable')); };
    document.head.append(script);
  });
  return sdkLoad;
}

export function createAnalytics(config, { load = loadPosthog, storage, url = () => location.href } = {}) {
  let allowed = false;
  let generation = 0;
  let sdk;
  let ready = false;
  let attribution;
  let queue = [];
  const once = new Set();
  const available = config.enabled === true && !!config.token && config.apiHost === 'https://eu.i.posthog.com';
  const clear = () => {
    for (const store of [storage, (() => { try { return window.sessionStorage; } catch { return null; } })()]) {
      try {
        for (const key of Object.keys(store)) {
          if ([FIRST_TOUCH_KEY, SESSION_TOUCH_KEY].includes(key) || key.includes('reserbot_analytics') ||
            key.startsWith('reserbot.analytics.sdk-consent')) store.removeItem(key);
        }
      } catch { /* Storage may be unavailable. */ }
    }
  };
  const send = item => {
    try { sdk.capture(item.name, { ...attribution(sdk.get_session_id()), ...item.properties }); }
    catch { /* Analytics must never interrupt the booking flow. */ }
  };
  return {
    get active() { return available && allowed; },
    async setConsent(state) {
      const next = state === 'accepted' && available;
      if (allowed === next && next) return;
      allowed = next;
      const current = ++generation;
      if (!allowed) {
        ready = false;
        queue = [];
        attribution = undefined;
        try { sdk?.stopSessionRecording(); } catch { /* Best effort SDK shutdown. */ }
        try { sdk?.opt_out_capturing(); } catch { /* Local gate is already closed. */ }
        clear();
        return;
      }
      attribution = createAttribution(storage, url());
      try {
        const instance = await load();
        if (!allowed || generation !== current) return;
        if (!sdk) {
          sdk = instance;
          sdk.init(config.token, posthogOptions(() => allowed));
        }
        sdk.opt_in_capturing({ captureEventName: false });
        sdk.startSessionRecording({ sampling: true });
        ready = true;
        queue.splice(0).forEach(send);
      } catch { queue = []; }
    },
    capture(name, properties = {}, onlyOnce = false) {
      if (!allowed || !EVENTS.has(name) || (onlyOnce && once.has(name))) return;
      if (onlyOnce) once.add(name);
      const safe = LOCATIONS[name]?.includes(properties.location) ? { location: properties.location } : {};
      const item = { name, properties: safe };
      if (ready) send(item);
      else if (queue.length < 50) queue.push(item);
    },
  };
}
