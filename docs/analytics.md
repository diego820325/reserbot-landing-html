# Consent-based landing analytics

## Release status

Production activation explicitly authorized on 2026-09-22 for EU project 281452.
`analytics-config.js` contains the public browser token and `enabled: true`;
SDK download, initialization and capture still require explicit consent. The
reviewed notice is version `2026-09-22` and analytics consent version is `2`.
Dashboard checks confirmed IP discard ON and GeoIP paused. Record user sessions
is now enabled; network/header/body capture remain OFF. No other remote setting
was changed. Historical local verification and pre-activation notes below describe
the state at those earlier steps, not the current activation authorization.

The development server separately reads ignored `.env.local` values
`POSTHOG_LOCAL_ENABLED` and `POSTHOG_PUBLIC_TOKEN`. The production build never
reads that file. Automated browser tests intercept ingestion and Formspree.
No other analytics provider or advertising pixel is added.

## Consent

`reserbot.analytics.consent` in localStorage contains `state` (`accepted` or
`rejected`), `consent_version`, and `recorded_at`. Missing, malformed, or obsolete
versions mean `undecided`. **There is no automatic time-based expiration.** The
timestamp is diagnostic metadata, not a server-verified consent audit record.
Current `CONSENT_VERSION` is `2`, renewing version-1 choices for the expanded
notice. The form independently sends notice version `2026-09-22`; its explicit
authorization and payload field names are unchanged. Neither choice grants the
other consent.
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
and removes local attribution/SDK storage. SDK 1.434.8 may still send a batch
queued before withdrawal (accepted limitation, 2026-09-22). No new events or
replay capture may be generated after withdrawal. Use official SDK APIs only;
do not patch transports, private queues, or introduce artificial delays.
Already delivered data is not deleted
by withdrawing consent; provider-side deletion is a separate operation.

## Capture contract

`main.js` dispatches the payload-free `trial:accepted` DOM event only after the
existing adapter returns `{ accepted: true }`. Analytics observes that notification.
The form never imports or waits for analytics. Its adapter contract and payload
shape are unchanged; the notice reference for new submissions is `2026-09-22`.
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
- Owner confirmed PostHog Free retention: Product Analytics events up to one
  year; Session Replay up to 30 days. Seven-year Pay-as-you-go retention does
  not apply. These are separate from the six-month lead retention. Review the
  notice and consent version when provider, plan or retention changes materially.
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
removed sensitive URL parameters/fragments, set no cookies, and stopped new capture after withdrawal. A later SDK 1.434.8 check found
pre-withdrawal queued batches can still be delivered; see the accepted limitation
in the consent section. Axe/reduced-motion checks and visual
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


## Controlled EU verification — 2026-09-22

Project 281452 and its public token were verified in the EU dashboard. Production
remains disabled (`enabled: false`, empty token), including the configuration
fetched from https://reserbot.co/js/analytics-config.js after this verification.
No deployment, commit, push, or real Formspree submission was performed.

- Automated verification: 17 unit tests, all 24 E2E tests (including real SDK
  1.434.8 with intercepted ingestion), and the production build passed.
- Local browser network observation: zero PostHog requests and no SDK before
  consent or after rejection/reload. Acceptance loaded EU assets. Effective host,
  token, `person_profiles: never`, disabled autocapture/pageview/pageleave,
  exceptions/performance/console, input masking and form exclusion were checked.
- Playwright's automated browser was classified as a bot by the SDK and did not
  ingest. The actual end-to-end session therefore used connected normal Chrome,
  without SDK patches or changes to the application's capture configuration.
- Dashboard observation: `landing_view`, `engaged_10s`, `hero_passed`,
  `reached_benefits`, `reached_differentiation`, `reached_pricing`, `demo_clicked`,
  `trial_cta_clicked`, and `trial_form_started` were received. Ten events total
  included two intentional demo clicks. No automatic pageview/autocapture or
  real `trial_submitted` was observed. Submission acceptance/failure behavior was
  verified only with the existing intercepted Formspree tests.
- `utm_source=local_qa`, `utm_medium=controlled`,
  `utm_campaign=qa_20260922_final`, `utm_content=landing`,
  `utm_term=barber_test` and the corresponding five `first_utm_*` properties
  appeared on received events with the same session ID. Received properties
  showed identified=false, person-profile processing=false and GeoIP disabled.
- [Verified replay](https://eu.posthog.com/project/281452/replay/01a0ca09-e5ab-79a6-80c0-766a5bd12919):
  visually played the local session; the whole form appeared as an opaque striped
  block. Synthetic name, business, email, phone and link values were not visible.
  Inspected event properties contained no entered form values. No real personal
  data was entered. This is evidence for this controlled session, not a claim of
  a comprehensive provider-side data audit.
- Revocation stopped recording, opted out and left only the application consent
  key in localStorage and no sessionStorage keys in the automated real-SDK run.
  The intercepted SDK test verifies no new capture after revocation, while
  permitting delivery of earlier queued payloads as explicitly accepted.
- Only Record user sessions was changed remotely, ON temporarily and OFF again
  with a success confirmation. Network capture, headers and bodies remained OFF.
  Sampling was 100%, no minimum duration or configured triggers; replay retention
  displayed 30 days. Remote console capture was ON but client-side
  `enable_recording_console_log: false` takes precedence; it was not changed.
- Commercial issue observed separately: https://demo.reserbot.co returned
  Cloudflare 525 (SSL handshake failed). Fix the demo before driving traffic there.

At that verification, privacy-notice approval, event retention/IP-discard review
and separate public activation authorization remained outstanding. The owner
subsequently confirmed Free retention and approved preparing the incremental
notice; final copy review, IP-discard review and public activation authorization
remain outstanding. Do not infer activation permission
from this successful local verification.


## Notice and consent verification — 2026-09-22

The incremental privacy update passed 19 unit tests, 26 E2E tests (including the
intercepted real SDK), and the production build. Checks cover separate analytics
and form authorizations, old consent renewal, notice/payload version agreement,
visible consent actions at 320/390/768/1440px, keyboard, axe and reduced motion.
The previous notice text was compared with the tracked version: only its date /
version and the added analytics section changed. Production configuration remains
disabled with an empty token. No deployment or remote settings change occurred.
