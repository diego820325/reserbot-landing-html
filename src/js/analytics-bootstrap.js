import { analyticsConfig } from './analytics-config.js';
import { createAnalytics } from './analytics.js';
import { mountConsent } from './consent.js';
import { observeLanding } from './landing-tracking.js';

// The local preview can review consent UX without a project or network traffic.
const localPreview = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
if (localPreview || (analyticsConfig.enabled && analyticsConfig.token)) {
  let storage;
  try { storage = localStorage; } catch { /* Analytics also works without persistence. */ }
  const analytics = createAnalytics(analyticsConfig, { storage });
  let stopObserving = () => {};
  mountConsent(state => {
    stopObserving();
    void analytics.setConsent(state);
    stopObserving = analytics.active ? observeLanding(analytics) : () => {};
  });
}
