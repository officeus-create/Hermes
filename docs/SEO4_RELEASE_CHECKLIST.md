# SEO-4 Release Checklist

Production source: current `main`, not earlier production HTML.

- [ ] Deploy current `main` to Cloudflare Pages.
- [ ] Record deployed commit and immutable `*.pages.dev` URL.
- [ ] Verify homepage role router.
- [ ] Verify direct carrier intake.
- [ ] Verify direct customer transport intake.
- [ ] Verify `noindex,follow` and sitemap exclusion for both intake routes.
- [ ] Verify evergreen Load Board demo labels.
- [ ] Reconcile one synthetic carrier delivery.
- [ ] Reconcile one synthetic customer-transport delivery.
- [ ] Verify duplicate suppression for both.
- [ ] Confirm direct email/phone fallbacks.
- [ ] Confirm rollback deployment and `LEAD_DELIVERY_MODE=off`.
