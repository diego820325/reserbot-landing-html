import { trialConfig } from './trial-config.js';

export function createTrialService(config, fetchRequest = globalThis.fetch) {
  const available = config.enabled === true &&
    /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(config.endpoint);
  return Object.freeze({
    available,
    async submit(request) {
      if (!available) throw new Error('Trial request submission is not configured.');
      if (request.privacyConsent !== 'accepted') throw new Error('Privacy authorization is required.');
      const response = await fetchRequest(config.endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        credentials: 'omit',
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          businessName: request.businessName,
          ownerName: request.ownerName,
          email: request.email,
          phone: request.phone,
          businessLink: request.businessLink,
          privacyConsent: 'accepted',
          privacyVersion: '2026-09-22',
          privacyNotice: '/privacidad.html',
          consentRecordedAt: new Date().toISOString(),
          _gotcha: request._gotcha || '',
        }),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        throw new Error('Trial request was not accepted.');
      }
      return { accepted: true };
    },
  });
}

export const trialService = createTrialService(trialConfig);
