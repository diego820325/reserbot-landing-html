# Cloudflare Pages deployment

Selected provider: Cloudflare Pages Free. No deployment or nameserver change has
been completed. The intended public domain is reserbot.co.

## Git-connected project

Use the Git integration at project creation; Direct Upload projects cannot later
switch to Git integration without creating another project.

- Repository: diego820325/reserbot-landing-html
- Project name: reserbot-landing-html (subject to availability)
- Branch: main
- Framework preset: None
- Build command: npm run build
- Output directory: dist
- Root directory: repository root
- Node version: 22 or later

Current local privacy changes must be reviewed, explicitly approved for commit,
and pushed before deploying main. Do not publish the older repository snapshot.

## Domain transition

1. Obtain a fresh complete Porkbun DNS backup. A private snapshot was saved to
   /tmp/reserbot-dns-backup.json during preparation; it is temporary and not tracked.
2. Add the domain to Cloudflare Free and compare every imported record against
   the backup. Preserve MX, SPF, DKIM, verification TXT and all subdomains.
3. Check DNSSEC/DS state before switching nameservers and follow Cloudflare's
   migration procedure; avoid leaving an incompatible registrar DS record.
4. Only use the two nameservers assigned to this exact Cloudflare zone.
   Keep domain registration at Porkbun. Do not replace mail routing records.
5. Add the Pages custom domain and complete HTTPS verification.
6. Verify apex, privacy page, demo links, and mail forwarding after propagation.
   Test consent evidence from the public form and confirm receipt in Gmail.

No analytics, paid plan, or extra services are required by this deployment plan.

References:
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
