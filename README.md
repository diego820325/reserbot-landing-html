# Reserbot website

Independent static commercial website for Colombian barbershops. Built with HTML,
Tailwind CSS v4's official CLI, and small vanilla JavaScript modules. Node.js 22+
is required. There is no application framework or browser-side CSS runtime.

## Local development

```sh
npm ci
npm start
```

Open http://127.0.0.1:4173. Tailwind watches source changes; refresh the browser
for HTML and JavaScript updates. The preview server binds to localhost only.

```sh
npm test
npm run test:e2e
npm run build
```

Browser checks use an installed Google Chrome through Playwright and axe-core.
They cover four viewport widths, WCAG A/AA automated checks, keyboard entry,
reduced motion, asset loading, and disconnected/success/failure form states.
These tools are development-only dependencies.

Deploy only `dist/` to a static host when launch requirements are complete. No
hosting account, DNS, or deployment is configured by this project.
The canonical origin is `https://reserbot.co`; all demo links target
`https://demo.reserbot.co`. The demo deployment is a separate prerequisite.

## Trial requests: Formspree

The form is enabled locally with Formspree. A test notification reached the
owner inbox on 2026-09-21 after being released from Formspree spam; a second
test reached the inbox automatically without intervention. Provider
acceptance does not guarantee inbox delivery; review the spam queue regularly.
The form stays disabled without JavaScript. See [TODO.md](TODO.md) for launch checks.

Formspree Free is the selected receiving service. The adapter in
`src/js/trial-service.js` posts JSON to Formspree, omits credentials, bounds the
request to 15 seconds, and requires an explicit successful provider response.
Set the public form endpoint in `src/js/trial-config.js`; keep `enabled: false`
until recipient verification, server-side field rules, spam protection, privacy
notice, and real delivery checks are complete. Never put account API keys here.
The `_gotcha` field supports Formspree's honeypot filtering.

Its contract
is `available: boolean` and `submit(request): Promise<{ accepted: true }>`.
`accepted: true` must mean that the service actually accepted the request. Reject
on validation, network, or server failures. Do not enable `available` until delivery
has been verified end to end. UI handling in `main.js` covers pending, failure,
retry, and acknowledged success; it never treats an arbitrary response as success.
The receiving service must validate and limit input, prevent abuse, and handle
customer data appropriately. Agree on the necessary privacy notice before enabling
collection. No backend changes are included here.

The five fields are business name, owner name, email, phone, and a business link
(or Instagram handle). This is a trial request, not full business configuration.

## Product and design decisions

- Source: `../reserbot-spa-angular/docs/brand-visual-identity.md` and the public
  chat template in `../reserbot-spa-angular/src/app/app.html`.
- Official wordmark copied from the existing frontend; no replacement typography
  or invented mascot. The SVG wordmark is also used as the favicon because there
  is no approved standalone brand symbol. Open Graph uses the official black PNG.
- The chat is a static, accessible HTML illustration, never an iframe or widget.
  Its barbershop and conversation are explicitly illustrative.
- “Corte y barba” represents a single combined catalog service, not a multi-service
  booking capability. Configure this combined service in the demo before launch.
- System font stack avoids external font requests. The wordmark SVG contains paths.
- Trial: 30 days, no payment method, no automatic paid conversion, configuration
  included. Price: COP 59,900/month or COP 599,000/year, one plan for the business.
- The public website targets barbershops in Colombia, even though the product's
  broader workspace documentation includes other appointment-based businesses.
- These approved commercial decisions supersede older context that described
  pricing as undecided and used `.com`. Existing repositories remain untouched.

## Maintenance

Keep copy in Colombian Spanish and code/documentation in English. Preserve visible
keyboard focus, semantic headings, reduced-motion preferences, and WCAG AA contrast.
Do not add fabricated customer proof, WhatsApp integration claims, analytics, or
unapproved product capabilities. Commits require explicit approval after review.

## Privacy publication status

`src/privacidad.html` is the authoritative notice prepared for publication,
version `2026-09-21`, effective 21 September 2026. The form requires an
unchecked-by-default authorization and sends that version and a client timestamp.
Keep the notice and adapter versions aligned when changing the policy. The earlier
Markdown draft is historical working material, not the publishable source.
Confirm provider-side enforcement and preservation of authorization fields.
No automated retention system is configured and the site has not been deployed.

See `docs/privacy-operations.md` and the empty templates in `docs/templates/`.
Never commit populated registers. The owner chose to focus this notice on
Colombian trial requests and defer additional jurisdiction/provider review to
the AWS migration. This decision is not a finding of regulatory compliance.
