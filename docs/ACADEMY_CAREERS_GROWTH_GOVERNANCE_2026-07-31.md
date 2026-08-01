# Academy, Careers, and Growth Governance

Date: 2026-07-31  
Tracking: Issue #20, draft PR #19, queue tasks 191–200

## Academy public boundary

The public Academy page presents two programs only:

1. U.S. Logistics Operations
2. Marketing

Leadership and technology may appear as supporting concepts or optional exercises, but they are not separate public Academy programs or enrollment offers.

The public page uses awareness, understanding, and application, followed by six capability layers. Capability layers are educational structure, not guaranteed job titles, promotions, clients, certifications, income, or company access.

## Paid cohort versus free practice

A paid cohort requires an owner-approved public offer with exact program, scope, dates, price, payment terms, refund terms, capacity, and enrollment route.

Free practice is a separate application and eligibility model. It may include orientation, exercises, attendance rules, feedback, quality review, and removal for inactivity or policy violations.

The two models are not interchangeable. Neither guarantees participation, access duration, team placement, employment, compensation, clients, promotion, certification, or future paid work.

The current website publishes no fixed Academy price and accepts no Academy payment.

## Careers and vacancies

The central `/logistics/careers/` route accepts a general professional-interest inquiry for manual review.

The current verified public vacancy registry is empty. Therefore:

- no specific public vacancy page is created;
- no salary, commission, benefits, schedule, country eligibility, or employment type is invented;
- no `JobPosting` schema is emitted;
- a general inquiry is not represented as an application to an open role.

A future vacancy may use `JobPosting` only when the role is verified open, owner-approved, and has complete employment type, location, description sources, application route, review date, and valid-through date.

## Career privacy and conversion

The approved careers path collects only the minimum information needed for manual routing through a private intake or direct email workflow: role interest, country/time zone, languages, relevant experience, availability, and contact method.

Do not place identity documents, financial information, credentials, passwords, private company records, or sensitive personal details in public URLs or analytics events.

Submission does not guarantee review timing, interview, training access, team placement, employment, contract, compensation, promotion, or future work.

## Search Console release watchlist

Every new or materially changed indexable URL enters the release watchlist with:

- PR number and sitemap;
- merge/deployment state;
- live verification date;
- inspection-request state;
- indexing state;
- seven-day metrics;
- approved aggregate qualified inquiries;
- one explicit next action.

Pending PR URLs remain `owner_merge_required` and `not_requested`. Search Console inspection must not be requested before owner-approved merge, deployment, and live canonical verification.

No Search Console, GA4, or inquiry metric is guessed.

## Weekly scorecard

Review release state, latest-head CI, live HTTP/canonical after deployment, Search Console indexing, impressions, clicks, CTR, average position, query families, privacy-safe CTA/contact events, approved qualified inquiries, cannibalization, and technical defects.

## Monthly scorecard

Review indexed versus released URLs, non-branded query growth, service-cluster trends, approved carrier/customer/digital inquiry quality, freshness, claims evidence, broken crawl paths, and competing pages.

Expand only when service relevance, search signals, response capacity, proof, and conversion path are verified.

## Final readiness gate

A batch is ready for owner merge review only when:

- current main and PR stack are reconciled;
- privacy and claims boundaries pass;
- required pages and schemas match visible content;
- contact channels are correct and preview-first;
- build, static/unit/registry, and Playwright checks pass on the latest head;
- no merge, deploy, DNS, Cloudflare, billing, credential, deletion, or public communication action is bundled into the code change.

Owner approval is still required separately for merge and deployment.
