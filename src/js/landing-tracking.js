export function observeLanding(analytics) {
  const hero = document.querySelector('section[aria-labelledby="hero-title"]');
  if (!hero) return () => {};
  const abort = new AbortController();
  const listen = (target, name, handler) => target.addEventListener(name, handler, { signal: abort.signal });
  const active = () => document.visibilityState === 'visible' && document.hasFocus();
  const captureOnce = name => analytics.capture(name, {}, true);
  captureOnce('landing_view');

  let engaged = 0;
  let previous = performance.now();
  let wasActive = active();
  const headings = new Map([
    ['benefits-title', 'reached_benefits'], ['conversation-title', 'reached_differentiation'],
    ['price-title', 'reached_pricing'],
  ]);
  const visible = new Map();
  const dwell = new Map();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      visible.set(entry.target.id, entry.isIntersecting && entry.intersectionRatio >= 0.5);
      if (!visible.get(entry.target.id)) dwell.delete(entry.target.id);
    }
  }, { threshold: [0, 0.5] });
  for (const id of headings.keys()) observer.observe(document.getElementById(id));

  const tick = () => {
    const now = performance.now();
    const elapsed = Math.min(now - previous, 500);
    const isActive = active();
    if (wasActive && isActive) {
      engaged += elapsed;
      if (engaged >= 10000) captureOnce('engaged_10s');
      if (hero.getBoundingClientRect().bottom <= 0) captureOnce('hero_passed');
      for (const [id, event] of headings) {
        if (visible.get(id)) {
          const duration = (dwell.get(id) || 0) + elapsed;
          dwell.set(id, duration);
          if (duration >= 1000) captureOnce(event);
        }
      }
    } else dwell.clear();
    previous = now;
    wasActive = isActive;
  };
  const timer = setInterval(tick, 100);
  for (const event of ['focus', 'blur']) listen(window, event, tick);
  listen(document, 'visibilitychange', tick);
  listen(document, 'click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    let location;
    if (link.closest('nav')) location = 'navigation';
    else if (hero.contains(link)) location = 'hero';
    else if (link.closest('#precio')) location = 'pricing';
    else if (link.closest('section[aria-labelledby="final-title"]')) location = 'final_cta';
    else if (link.closest('#demo')) location = 'demo';
    else if (link.closest('#submission-notice')) location = 'submission_notice';
    else if (link.closest('footer')) location = 'footer';
    if (!location) return;
    if (link.getAttribute('href') === '#solicitud') analytics.capture('trial_cta_clicked', { location });
    if (link.href === 'https://demo.reserbot.co/') analytics.capture('demo_clicked', { location });
  });
  const form = document.querySelector('#trial-form');
  const started = event => {
    if (event.target.matches('fieldset input:not([type="checkbox"]):not([hidden])')) captureOnce('trial_form_started');
  };
  listen(form, 'focusin', started);
  listen(form, 'input', started);
  listen(form, 'trial:accepted', () => captureOnce('trial_submitted'));
  return () => { abort.abort(); clearInterval(timer); observer.disconnect(); };
}
