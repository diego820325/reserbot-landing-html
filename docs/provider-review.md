# Provider review — 2026-09-21

Scope: trial-request form, Formspree Free, Porkbun forwarding, personal Gmail.
The owner confirmed administering Reserbot from Croatia. Treat GDPR applicability
as a material issue requiring assessment of actual EU establishment; customers
being Colombian does not by itself exclude GDPR. Do not certify compliance based
on this review or silently substitute Workspace terms for personal Gmail.

## Findings

| Service | Verified public evidence | Remaining action |
| --- | --- | --- |
| Formspree | Security page states use of SCCs as processor. | Obtain the agreement applicable to the Free account, acceptance mechanism, subprocessors, locations and deletion terms. |
| Porkbun forwarding | Public privacy policy exists. | Confirm role and whether processor terms cover forwarded message contents; absence from search is not proof none exist. |
| Personal Gmail | Google explicitly says no DPA is offered for consumer Gmail or Drive. | Assess the role and lawful arrangement; cannot mark an Article 28 processor-contract requirement satisfied using this service. |

This is a concrete contractual gap, not a conclusion that every use of personal
Gmail is unlawful. If the processing requires an Article 28 processor arrangement,
the current personal Gmail setup does not supply one. Adding consent text does
not replace that requirement.

Do not buy a mailbox, migrate providers, disable notifications, or send these
inquiries without authorization. The user's preference remains no paid email.
A possible alternative is retaining requests only in a contracted form service;
first verify that notifications can omit personal data or be disabled and that
privacy requests still have an appropriate contact channel. This is not yet a
verified replacement workflow.

## Prepared inquiries — not sent

### Formspree

Subject: Data processing agreement for Free plan used from Croatia

I operate Reserbot as an individual from Croatia and use a Free form for trial
requests from Colombian businesses. Please provide the DPA applicable to my
account and explain how to execute or accept it. Please confirm subprocessors,
processing locations, international-transfer safeguards and deletion/backup terms.
Can Free-plan email notifications be disabled or contain only a generic alert
without submitted personal data? Can required consent and notice-version fields
be validated and retained server-side on this plan?

### Porkbun

Subject: Data processing terms for free email forwarding

I operate a business from Croatia and use Porkbun free forwarding for customer
inquiries. What role does Porkbun assume for message contents and metadata? Do
you offer an Article 28 GDPR agreement for this service? Please provide applicable
terms, subprocessors, processing locations, international-transfer safeguards and
message retention/deletion details.

## Policy changes to complete after provider decision

Assess the appropriate lawful basis for each purpose rather than treating a
mandatory checkbox as a solution to every GDPR obligation. Include relevant EU
rights, withdrawal where consent applies, supervisory complaint routes and
international safeguards in the final notice. Confirm whether the Colombian
address is a contact address or actual domicile; do not infer either from travel.

For GDPR requests, respond without undue delay and within one calendar month;
where justified by complexity/number, an extension up to two additional months
requires notice and reasons within the first month. Preserve independently any
shorter applicable Colombian deadline. The Colombian prior-complaint procedure
must not be presented as a condition for lodging an EU supervisory complaint.

## Primary sources

- Google consumer Gmail DPA statement: https://support.google.com/policies/answer/9581826?hl=en
- Formspree security: https://formspree.io/security/
- Porkbun privacy: https://porkbun.com/legal/agreement/privacy_policy
- GDPR, Articles 3, 12, 13, 28, 44–49 and 77: https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=celex%3A32016R0679
- Croatian authority rights guidance: https://azop.hr/data-subject-rights/
- EDPB territorial scope: https://www.edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_3_2018_territorial_scope_after_public_consultation_en.pdf

## Scope decision — deferred review

The owner chose to focus current work on the Colombian trial-request notice and
retain the free workflow. Additional jurisdiction/provider review is deferred to
the AWS migration; provider inquiries must remain unsent. Earlier findings remain
reference material, not active implementation prerequisites or resolved issues.
Actual operations from Croatia and processing abroad have not changed. Neither
this deferral nor migration to AWS constitutes a compliance determination.
