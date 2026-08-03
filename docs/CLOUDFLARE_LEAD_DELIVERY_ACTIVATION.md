# Cloudflare production lead delivery

Status: repository implementation complete; external Cloudflare activation not yet approved or verified.

## Selected architecture

Hermes uses the supported separation below:

`browser -> same-origin Pages Function -> Service Binding -> private Email Worker -> Cloudflare Email Service`

The Pages Function owns public intake validation, same-origin enforcement, request-size limits, server-controlled sales tags, idempotency and hashed-IP rate limiting. The dedicated Worker owns the Email Service binding, fixed sender/destination restrictions and provider-error normalization.

The Email Worker has no route, disables `workers.dev` and disables preview URLs. It is intended to be called only by the Pages project through the `LEAD_EMAIL_SERVICE` Service Binding.

## Repository files

- `functions/api/logistics-lead.ts` — public same-origin intake endpoint.
- `workers/lead-email/src/index.mjs` — private delivery Worker.
- `wrangler.jsonc.example` — Pages bindings and default-off delivery mode.
- `workers/lead-email/wrangler.jsonc.example` — Worker and Email Service binding.
- `scripts/sales-lead-receiver.test.mjs` — end-to-end boundary tests with no external send.

## Default-off boundary

The public receiver sends only when all of these bindings exist:

- `LEAD_DELIVERY_MODE=live`;
- `LEAD_EMAIL_SERVICE` Service Binding;
- `LEAD_LIMITS` KV namespace;
- encrypted `LEAD_SERVICE_TOKEN` secret.

Missing or non-live configuration returns the generic `delivery_not_configured` response. The repository does not contain the token, Cloudflare account ID, KV IDs or any real lead.

## Required authenticated Cloudflare work

1. Confirm that `hermeslogisticsus.com`, or an approved sending subdomain, is using Cloudflare DNS.
2. Onboard the sending domain in Cloudflare Email Service.
3. Verify the generated SPF, DKIM, DMARC and bounce-domain records.
4. Verify `website@hermeslogisticsus.com`, or replace it with another owner-approved sender.
5. Verify the fixed destination `officeus@hermeslogisticsus.com`, or replace it with another owner-approved sales mailbox.
6. Create separate preview and production KV namespaces for `LEAD_LIMITS`.
7. Copy `workers/lead-email/wrangler.jsonc.example` to a non-example configuration and deploy `hermes-lead-email`.
8. Store the same strong random `LEAD_SERVICE_TOKEN` as an encrypted secret on the Email Worker and the Pages project. Never put it in Wrangler vars, GitHub, build logs or browser code.
9. Add the Pages Service Binding named `LEAD_EMAIL_SERVICE` targeting `hermes-lead-email`.
10. Keep `LEAD_DELIVERY_MODE=off` in production while preview verification runs.
11. In a restricted preview deployment, set the preview origin, bindings and `LEAD_DELIVERY_MODE=live`; send one synthetic lead using non-personal test data.
12. Reconcile the synthetic delivery with Email Service logs, duplicate handling, quota behavior and direct fallback.
13. After owner review, set production `LEAD_DELIVERY_MODE=live` and verify one approved synthetic production submission.

## Error boundary

The private Worker maps provider failures into internal categories:

- `provider_throttled` — rate, quota or daily-limit response;
- `provider_configuration` — sender, destination, verification or permission problem;
- `provider_unavailable` — temporary service, network or upstream failure;
- `provider_rejected` — other provider rejection.

The Pages Function does not expose those diagnostics, provider messages, email addresses, phone numbers, raw IP addresses or secrets to the browser. It returns only generic delivery failure or temporary-unavailability responses.

## Logging and privacy

- The public endpoint stores only hashed request IDs and hashed IP-derived rate keys in KV.
- The Email Worker logs only a fixed event name and mapped failure category.
- Submitted message text, contact values, raw IPs, tokens and provider diagnostics must not be written to GitHub, analytics or public logs.
- Cloudflare Email Service logs remain inside the authenticated account and must not be copied into public issues with lead content.

## Rollback

Immediate rollback does not require a code revert:

1. Set production `LEAD_DELIVERY_MODE=off`.
2. Redeploy or save the Pages environment configuration.
3. Confirm the endpoint returns `delivery_not_configured`.
4. Keep direct phone/email fallback visible.
5. Investigate the Worker or Email Service without retrying an ambiguous lead automatically.

Removing the Service Binding or rotating `LEAD_SERVICE_TOKEN` also stops delivery, but the environment-mode switch is the preferred first rollback.

## Acceptance evidence still required

Do not call the workflow live until the authenticated Cloudflare account proves:

- sending-domain onboarding and authentication;
- fixed sender and destination restrictions;
- separate preview and production KV bindings;
- matching encrypted tokens;
- successful synthetic preview and production delivery;
- duplicate, rate-limit, timeout and provider-unavailable tests;
- preserved direct fallback and immediate rollback.

Official platform references:

- Cloudflare Pages Functions bindings: https://developers.cloudflare.com/pages/functions/bindings/
- Cloudflare Email Service sending: https://developers.cloudflare.com/email-service/get-started/send-emails/
- Configure Email Service send bindings: https://developers.cloudflare.com/email-service/configuration/send-bindings/
- Wrangler configuration: https://developers.cloudflare.com/workers/wrangler/configuration/
