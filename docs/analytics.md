# Consent-based landing analytics

## Release status

Implemented locally, **not activated for production**. `analytics-config.js` ships
with `enabled: false` and an empty public project token. Localhost previews show
the consent UI without loading PostHog. Automated browser tests replace the config
and SDK through Playwright routes. No real project token is needed for testing.
Do not enable public collection until the owner reviews the real EU project,
public token, retention, provider configuration, and updated privacy notice.
The existing trial-request notice remains unchanged; the banner is UI copy, not a
replacement legal notice. No other analytics provider or advertising pixel is added.

## Consent

`reserbot.analytics.consent` in localStorage contains `state` (`accepted` or
`rejected`), `consent_version`, and `recorded_at`. Missing, malformed, or obsolete
versions mean `undecided`. **There is no automatic time-based expiration.** The
timestamp is diagnostic metadata, not a server-verified consent audit record.
Increment `CONSENT_VERSION` only after reviewing a material processing/configuration
change requiring renewed consent. Routine releases do not invalidate consent.
Browser storage clearing also removes the choice. If storage is unavailable, the
choice works for the current page only, and a subsequent visit asks again.

The nonmodal bottom region offers Aceptar, Rechazar, and Privacidad directly.
Preferencias de analítica reopens it on the landing and privacy page. Accepting
trial-request processing is a separate, required form checkbox and never opts the
visitor into analytics. Consent changes propagate between tabs through storage events.

No SDK script, initialization, replay, event queue, or attribution persistence is
created before analytics acceptance. Revocation closes the local capture gate,
detaches observers, discards the local queue, stops recording, opts the SDK out,
and removes local attribution/SDK storage. Already delivered data is not deleted
by withdrawing consent; provider-side deletion is a separate operation.

## Capture contract

`main.js` dispatches the payload-free `trial:accepted` DOM event only after the
existing adapter returns `{ accepted: true }`. Analytics observes that notification.
The form never imports or waits for analytics. The adapter and payload are unchanged.
The analytics entry point is a separate module script, so even module-load failures
cannot prevent form initialization or submission.

| Event | Meaning / properties |
| --- | --- |
| `landing_view` | Landing initialized with consent; once per page load. |
| `engaged_10s` | 10 accumulated visible, focused seconds after consent; once per load. |
| `hero_passed` | Hero bottom above viewport during active observation; once per load. |
| `reached_benefits` | At least half of `#benefits-title` visible for one active second. |
| `reached_differentiation` | Same for `#conversation-title` in `#como-funciona`. |
| `reached_pricing` | Same for `#price-title` in `#precio`. |
| `demo_clicked` | Each click; `location`: hero, demo, footer, submission_notice. |
| `trial_cta_clicked` | Each click; `location`: navigation, hero, pricing, final_cta. |
| `trial_form_started` | First focus/input on an actual data field; no field name/value. |
| `trial_submitted` | Explicit provider acceptance; once per page load. |

Section events fire once per load. No pre-consent behavior is reconstructed.
Visible/focused time approximates attention, not proof of reading. Late consent
means earlier clicks, views, and time are absent. The SDK can be blocked; even
accepted form submissions can be missing from analytics. Provider acceptance is
not proof of inbox delivery or a qualified lead. Qualify interest manually.

## Attribution and minimization

Only `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` are read.
`first_utm_*` records the first consented arrival, including an empty direct
arrival; `utm_*` records entry to the current PostHog session. The latter is keyed
by the SDK session ID, so a return in a new session replaces the old attribution
even when it is direct. A campaign change within the same session does not rewrite
session-entry attribution. Both are attached to explicit events, including submission.
`reserbot.analytics.first-touch` and `reserbot.analytics.session-touch` persist
these values in localStorage after consent. No UTMs are added to Formspree.

Campaign tags must contain campaign labels, never personal data. The client rejects
oversized values and obvious emails, URLs, and phone-like strings, but cannot infer
whether an arbitrary campaign label is someone's name. Review campaign links.

Autocapture, automatic pageviews/pageleaves, heatmaps, rage/dead clicks, performance,
exception capture, console recording, surveys, and site apps are disabled.
Explicit event properties are allowlisted, retaining pseudonymous/session IDs,
limited browser/device/viewport metadata, clean URL, approved UTMs, and CTA location.
Query strings, fragments, referrers, click IDs, form data, and person properties
are not forwarded. `person_profiles: 'never'`; never call `identify()`.

Replay uses `maskAllInputs: true` and excludes the entire `#trial-form` using
both `blockSelector` and the static `ph-no-capture` class, including autofill and
the honeypot. Network headers/bodies, console, and JSON-LD capture are disabled;
replay page URLs are stripped of query strings and fragments in the browser.
Replay sampling is overridden to include all consented sessions once replay is
enabled on the project; delivery and short/blocked sessions are not guaranteed.

## Project and privacy review before activation

- Confirm PostHog Cloud EU (Frankfurt), `https://eu.i.posthog.com`, and public token.
- Confirm replay enabled, 100% sampling, no restrictive event/URL triggers, and
  the effective minimum recording duration. Verify actual replay playback.
- Enable project-side IP discard; disable GeoIP enrichment. IP is still processed
  by the network/provider; do not describe the service as never receiving it.
- Confirm actual event and replay retention and deletion procedures against the
  selected plan. Do not inherit the trial-request six-month retention policy.
- Disclose purposes, provider, pseudonymous identifiers, technical metadata,
  attribution, replay, excluded fields, EU hosting, international processing,
  local storage, withdrawal, retention, and applicable rights in the reviewed notice.
- Inventory actual browser storage with the selected SDK: configured persistence
  name `reserbot_analytics`, SDK consent prefix `reserbot.analytics.sdk-consent`,
  session/window bookkeeping in sessionStorage, and the three application keys.
  Persistence is localStorage, not cross-subdomain cookies; no demo identity linking.
- Recheck remote project settings cannot weaken client privacy controls. Use only
  synthetic data for the final controlled verification before public activation.

## Verification

Run `npm test`, `npm run test:e2e`, and `npm run build`. The browser suite covers
mocked ingestion, success/failure/ambiguous/timeout results, consent, focus/time,
viewport milestones, keyboard, axe, reduced motion, and four viewport widths.

The optional real-SDK test uses public assets downloaded separately, with all
PostHog requests intercepted (no real ingestion):

```sh
POSTHOG_SDK_PATH=/absolute/path/array.js POSTHOG_RECORDER_PATH=/absolute/path/lazy-recorder.js npm run test:e2e -- tests/e2e/analytics-sdk.spec.js
```

Do not commit downloaded SDKs or test artifacts. SDK remote scripts can change;
rerun this check when reviewing SDK behavior and before public activation.

Local verification on 2026-09-22: 17 unit tests, 24 browser tests (including the
optional real SDK test with SDK 1.434.7), and the production build passed. All
PostHog and Formspree test traffic was intercepted. The real SDK test verified
replay started, excluded synthetic values entered before and after consent,
removed sensitive URL parameters/fragments, set no cookies, and stopped capture
and further requests after withdrawal. Axe/reduced-motion checks and visual
screenshots covered widths 320, 390, 768, and 1440. This does not verify actual
project retention, ingestion, replay playback in PostHog, or production activation.

## Reading the first visits

Use explicit events and individual session replays; generic PostHog web-analytics
pageview/bounce dashboards will not describe this custom event contract. Compare
campaign entry, engagement, sections, CTAs, form start, and provider acceptance.
Zero forms does not establish a product, pricing, or landing problem. Audience
quality and whether visitors can decide for a barbershop remain priority hypotheses.
Consent/blocking creates an unobserved population; do not equate PostHog counts
with total advertising visits. Meta Ads analysis remains separate and deferred.

References: [JavaScript](https://posthog.com/docs/libraries/js),
[configuration](https://posthog.com/docs/libraries/js/config),
[replay privacy](https://posthog.com/docs/session-replay/privacy),
[persistence](https://posthog.com/docs/libraries/js/persistence),
[sessions](https://posthog.com/docs/data/sessions),
[data storage](https://posthog.com/docs/privacy/data-storage).
