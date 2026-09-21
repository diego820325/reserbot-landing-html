# Pending work

## Trial-request destination

- Free Porkbun forwarding for `solicitudes@reserbot.co` was created and verified
  in the account's forwarding list on 2026-09-19. The destination is the owner's
  personal email, kept out of this repository.
- [x] Verify delivery with a real email before enabling trial-request collection.
  Confirmed on 2026-09-21: a test sent from a separate account to
  `solicitudes@reserbot.co` arrived in the destination Gmail inbox.
  Future forwarding tests must use a sender different from the destination.
- Creating this address does not connect the website form; the integration below
  remains required.

## Required before launching trial-request collection

- Decision (2026-09-21): use Formspree Free for speed; migrate to AWS later.
- Form endpoint configured: `https://formspree.io/f/mqpaqeqb`. A synthetic test
  was accepted on 2026-09-21 and inbox delivery verified after the owner released
  it from Formspree spam. A second test (RB-FS-20260921-02) reached the Gmail
  inbox automatically on 2026-09-21 without manual spam release.
  Review the spam queue for false positives.
- [ ] Create the Formspree form with notifications to `solicitudes@reserbot.co`,
  confirm the recipient, and configure required fields and length limits to match
  the website. Verify spam protection and the account's free submission quota.
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

The Formspree adapter is enabled locally. Before publication, verify provider
field rules and the privacy notice. Automatic notification delivery has been
verified with a fresh submission.

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
