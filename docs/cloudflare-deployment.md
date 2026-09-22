# Cloudflare Pages deployment

Selected provider: Cloudflare Pages Free. Production commit `e2e5903` deployed
successfully to https://reserbot-landing-html.pages.dev/ on 2026-09-21 (HTTPS 200).
Build: npm run build, output dist, Node 22.16.0. Git integration deploys main.

Porkbun confirmed nameserver update to naomi.ns.cloudflare.com and
randy.ns.cloudflare.com. Cloudflare imported both MX and all SPF/DKIM/DMARC records;
MX/SPF were also checked directly against its authoritative DNS. No DS record was
returned before the change. Propagation and apex Pages association completed on
2026-09-22; https://reserbot.co serves the landing over HTTPS. Existing wildcard points
to Porkbun parking, so demo.reserbot.co is not a deployed demo.

## Git-connected project

Use the Git integration at project creation; Direct Upload projects cannot later
switch to Git integration without creating another project.

- Repository: diego820325/reserbot-landing-html
- Project name: reserbot-landing-html
- Branch: main
- Framework preset: None
- Build command: npm run build
- Output directory: dist
- Root directory: repository root
- Node version: 22 or later

Privacy changes were approved, committed and pushed as `e2e5903` before the
initial deployment. Future pushes to main automatically trigger deployments.

## Domain transition reference (completed)

1. Obtain a fresh complete Porkbun DNS backup. A private snapshot was saved to
   /tmp/reserbot-dns-backup.json during preparation; it is temporary and not tracked.
2. Add the domain to Cloudflare Free and compare every imported record against
   the backup. Preserve MX, SPF, DKIM, verification TXT and all subdomains.
3. Check DNSSEC/DS state before switching nameservers and follow Cloudflare's
   migration procedure; avoid leaving an incompatible registrar DS record.
4. Only use the two nameservers assigned to this exact Cloudflare zone.
   Keep domain registration at Porkbun. Do not replace mail routing records.
5. Add the Pages custom domain and complete HTTPS verification.
6. Apex and privacy HTTPS checks completed. Remaining checks: demo deployment
   and public-form delivery/consent evidence after DNS migration.

No analytics, paid plan, or extra services are required by this deployment plan.

References:
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/

## Domain activation — 2026-09-22

Nameserver propagation confirmed. Associated reserbot.co with Pages, replacing
both imported parking A records with the Pages CNAME. HTTPS checks returned 200
for the landing and privacy page, with expected content and policy version.
Public MX records still point to fwd1/fwd2.porkbun.com. The apex initially returned
525 while it still pointed at parking; this was resolved by the Pages association.
The demo subdomain remains a separate pending deployment.
