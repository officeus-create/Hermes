# SEO 72-hour traffic batch acceptance criteria

The pull request is ready for owner review only when all of the following are true:

- homepage renders the three priority logistics links;
- Logistics hub renders all seventeen Wisconsin service and city links;
- `#logistics-resources` exists;
- all linked routes remain in the sitemap union;
- the IndexNow key is copied to the built site root;
- the IndexNow script passes offline dry-run validation;
- the manual workflow has `contents: read` and no automatic trigger;
- dependency, build, static, SEO, performance, unit, registry, and Playwright checks pass.

Merge, deployment, live IndexNow submission, and Search Console indexing requests remain owner-controlled.
