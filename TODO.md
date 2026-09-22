# Pending work

## Trial-request destination

- Free Porkbun forwarding for `solicitudes@reserbot.co` was created and verified
  in the account's forwarding list on 2026-09-19. The destination is the owner's
  personal email, kept out of this repository.
- [x] Verify delivery with a real email before enabling trial-request collection.
  Confirmed on 2026-09-21: a test sent from a separate account to
  `solicitudes@reserbot.co` arrived in the destination Gmail inbox.
  Future forwarding tests must use a sender different from the destination.

## Trial-request collection and follow-up

- Decision (2026-09-21): use Formspree Free for speed; migrate to AWS later.
- Form endpoint configured: `https://formspree.io/f/mqpaqeqb`. A synthetic test
  was accepted on 2026-09-21 and inbox delivery verified after the owner released
  it from Formspree spam. A second test (RB-FS-20260921-02) reached the Gmail
  inbox automatically on 2026-09-21 without manual spam release.
  Review the spam queue for false positives.
- [x] Create the Formspree form with notifications to `solicitudes@reserbot.co`
  and verify notification delivery.
- [ ] Verify provider-side required fields and length limits against the website.
  Browser validation alone is not server-side validation.
- [ ] Confirm the account uses the Free plan and inspect its quota and spam settings.
- [x] Complete the privacy notice with the confirmed data controller identity,
  processing purposes, contact details, retention policy, and user rights.
  - Publication text: [privacy notice](src/privacidad.html), version `2026-09-21`.
    Published on 2026-09-22 with rights, procedures and provider disclosures.
  - Additional jurisdiction and provider-contract review deferred at the owner's
    request; revisit with the AWS migration. This is not a compliance finding.
  - Effective date and form link are configured; operational tracking remains below.
  - Controller confirmed: Diego Mario Garcia Medellin, acting as an individual.
    Public use of the name and contact details was explicitly authorized.
  - After incorporation, replace the individual controller with the confirmed
    company details as applicable and notify affected data subjects of the change.
  - Approved retention: delete non-converted trial requests six months after
    last contact, including remaining Formspree records and email copies.
- [ ] Implement last-contact tracking and deletion at the approved deadline.
  No automatic deletion is configured. Define customer retention separately.
- [x] Set the public endpoint in `src/js/trial-config.js`, test actual delivery,
  and enable collection only after verifying success and failure behavior.

- [x] Connect the trial-request form to a real submission service that receives
  and stores requests or delivers them to the business through email.
  - Keep the submission integration separate from the form UI.
  - Verify delivery end to end and handle failed submissions visibly.
  - Show the approved success confirmation only after the receiving service
    confirms a successful submission.
  - Until connected, clearly communicate that submission is unavailable; never
    simulate a successful request.

The Formspree adapter is enabled on the published site. Automatic notification
delivery was verified before deployment; a fresh browser submission from the
custom domain and provider-side validation checks remain pending.

## Publish the website

- [x] Publish production on Cloudflare Pages Free, connected to GitHub main.
- [x] Configure HTTPS for `reserbot.co`; landing and privacy returned 200 on
  2026-09-22. Cloudflare nameservers propagated and Porkbun MX records remain intact.
- [ ] Deploy `demo.reserbot.co` and verify demo links; it still points to parking.
- [x] Deploy reviewed commit `e2e5903` through Cloudflare Pages.
- [ ] Submit a fresh test from `https://reserbot.co`, verify receipt after the DNS
  migration, and confirm stored authorization/version fields.

## Migrate trial requests to AWS

- [ ] Replace Formspree with API Gateway, Lambda, and SES; evaluate DynamoDB for
  durable request storage and retry tracking. Keep the form UI and adapter contract.
  - Define the target environment explicitly before deployment.
  - Verify the SES sender domain, configure least-privilege permissions, and
    preserve Porkbun forwarding to the owner's inbox.
  - Validate fields server-side, limit abuse, avoid logging personal data, and
    define retention and notification retry behavior.
  - Verify persistence, delivery, retries, and visible failures end to end before
    switching traffic; retire Formspree only after successful cutover.
  - Review migration before exceeding the free quota or requiring more control.

## Privacy integration review

- [x] Prepare local notice page, explicit authorization, version and timestamp fields.
- [x] Prepare manual request/retention procedures and empty private-register templates.
- [ ] Deferred to AWS migration: review jurisdiction given actual operations.
- [ ] Deferred to AWS migration: review provider agreements and safeguards.
- [ ] Confirm Formspree validates and preserves authorization evidence.
- [x] Prepare the approved publication text, remove review banners and set version
  and effective date to 2026-09-21. Published on 2026-09-22.
- [ ] Adopt the manual procedure and create populated registers in private storage.

## Deferred provider review

- [x] Document public evidence and prepare unsent provider inquiries in
  [provider-review.md](docs/provider-review.md).
- [ ] Revisit personal Gmail arrangements during migration.
- Provider inquiries remain unsent; owner declined contacting providers.
- [ ] Reassess applicable disclosures and actual operating location during migration.

Owner decision: prioritize the Colombian trial-request notice and current free
workflow. Additional review is deferred, not resolved. No assertion is made that
operations or provider processing occur exclusively in Colombia. AWS migration
alone does not establish legal compliance.
