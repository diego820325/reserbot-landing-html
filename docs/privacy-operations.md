# Manual privacy operations

Owner: Diego Mario Garcia Medellin. Status: procedure prepared for review;
no scheduled job or automated deletion is configured.

## Request handling

Check solicitudes@reserbot.co on each working day, including spam. Record a
request on receipt in a private register, using the supplied template. Keep the
populated register outside this public repository. Verify identity proportionately;
never send another person's data or collect identity documents by default.

Classify Colombian consultations and complaints using the deadlines in the notice.
Calculate working days with Colombian holidays. Record extensions and notify the
requester before expiry. Flag disputed records, track transfers and requests for
missing information, and retain the response reference. Handle any applicable
GDPR rights and deadlines separately after the EU scope review; this procedure
does not establish GDPR compliance.

## Retention

For each prospect, record last contact, conversion status and deletion due date
(six calendar months after last contact; clamp to month end where needed).
Check due dates each working day and arrange deletion no later than the deadline.
Delete remaining Formspree entries and Gmail copies, including relevant trash
copies. Verify both places independently. Do not assume deleting a submission
removes its notification email. Document only minimal evidence of completion;
do not preserve a copy of the deleted lead in this register.

Provider backups may follow separate deletion cycles. Verify provider terms;
do not claim instant erasure from backups. Define customer retention separately.
Earlier provider-side deletion does not require restoring a copy.

## Authorization evidence

The browser sends an explicit authorization value, notice version, path, and
client timestamp. Preserve the provider receipt timestamp and notification with
these fields, and archive the reviewed notice version. Browser timestamps and
fields are client assertions, not tamper-proof server evidence. Confirm these
fields survive Formspree processing and enforce authorization server-side where
supported before launch. Do not change policy text without changing its version.

## Provider and jurisdiction review

The owner confirmed operating from Croatia. Assess EU establishment and GDPR
scope before publishing; a Colombian contact address does not settle that scope.
Formspree publicly states reliance on SCCs as processor:
https://formspree.io/security/
This does not prove the applicable contract has been executed for this account.
Verify the actual Formspree, Porkbun forwarding and personal Gmail arrangements,
processor terms, subprocessors, international safeguards, retention and rights.
Do not substitute Google Workspace terms for this personal Gmail account.

Reference: https://www.edpb.europa.eu/sme/learn-the-basics/data-controller-or-data-processor_en

## Review follow-up

See [provider-review.md](provider-review.md) for the verified personal Gmail DPA
limitation, unsent inquiries, and EU deadline handling. No provider contract has
been accepted and no inquiry has been sent as part of this review.

## Scope decision — deferred review

The owner chose to focus current work on the Colombian trial-request notice and
retain the free workflow. Additional jurisdiction/provider review is deferred to
the AWS migration; provider inquiries must remain unsent. Earlier findings remain
reference material, not active implementation prerequisites or resolved issues.
Actual operations from Croatia and processing abroad have not changed. Neither
this deferral nor migration to AWS constitutes a compliance determination.


## Optional analytics notice update — prepared 2026-09-22

Notice version `2026-09-22` adds PostHog Cloud EU without changing the approved
trial-request purposes, controller, providers, rights or six-month lead retention.
The adapter records this notice version for new submissions only. Preserve prior
authorization evidence and the previous notice in version history; do not rewrite
old records or infer analytics consent from a trial request.

Analytics consent version `2` is independent of the notice version sent to
Formspree. The previous analytics version requires a fresh choice; no automatic
time expiry applies. Optional analytics uses browser local/session storage and
is separate from the form authorization. Withdrawal stops new collection but
does not itself erase already delivered data; handle deletion requests separately.

Owner-confirmed PostHog Free retention: Product Analytics up to one year and
Session Replay up to 30 days. Review the notice and analytics consent version
as appropriate when provider, plan or retention changes materially. No remote
settings or production activation were changed by preparing this notice.

After incorporation, review and replace the individual controller details in
privacy, terms and applicable documentation. This remains future work.
