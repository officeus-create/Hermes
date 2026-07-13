# Zero-Cost Hosting Comparison

Reviewed: 2026-07-11

## Recommendation

Use a private GitHub repository for source control and Cloudflare Pages for preview and production hosting. The approved production domain is `hermeslogisticsus.com`.

## GitHub Pages

Technical fit:

- Supports static sites and custom domains.
- GitHub Free Pages publishing uses a public repository.
- Build workflow can be implemented with GitHub Actions.

Business constraint:

- GitHub's official Pages limits state that Pages is not intended or allowed as free hosting for an online business, ecommerce site, or commercial SaaS.
- Hermes is a commercial business ecosystem, so GitHub Pages should not be the production host even though the Astro output is technically compatible.

Official references:

- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages

## Cloudflare Pages Free

Technical fit:

- Static Astro output can be deployed directly from `dist`.
- Branch and pull-request previews receive separate preview URLs.
- Preview deployments do not change the production URL.
- Custom domains and HTTPS are supported.
- The Free plan currently documents 500 builds per month, 20,000 files per site, a 25 MiB individual file limit, and unlimited active preview deployments.

Operational considerations:

- Preview URLs are public by default unless Cloudflare Access is configured.
- Apex-domain setup requires the domain to be a Cloudflare zone and nameserver changes.
- A subdomain can use a CNAME after it is associated in the Pages dashboard.
- No domain or DNS action is part of prototype v0.1.

Official references:

- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/configuration/preview-deployments/
- https://developers.cloudflare.com/pages/configuration/custom-domains/

## Safe First Test

1. Create or identify the GitHub repository after the owner approves repository visibility and ownership.
2. Push the `prototype/editorial-v1` branch.
3. Connect the repository to Cloudflare Pages Free.
4. Use production branch `main`, build command `npm run build`, output directory `dist`, and Node 22.
5. Review the generated `pages.dev` preview.
6. Keep the live domain and DNS untouched.
7. Record rollback and preview evidence before requesting production approval.

## Cost Boundary

The prototype uses no paid service, payment method, runtime API, database, or form backend. Any future third-party form, analytics, email, storage, or worker feature requires a separate review of free limits and external side effects.
