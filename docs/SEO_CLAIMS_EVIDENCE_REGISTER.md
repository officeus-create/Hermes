# Hermes SEO Claims-to-Evidence Register

This register governs public commercial copy, structured data, FAQs, examples, CTAs, social metadata, and localized versions. A claim may be published only when its evidence status and wording are approved.

## Status values

- **Approved:** evidence exists and the wording may be used as written.
- **Qualified:** the capability exists, but copy must include scope, eligibility, review, or non-guarantee language.
- **Pending evidence:** do not publish as a factual claim.
- **Prohibited:** do not publish because the statement is misleading, unsupported, private, or creates an unacceptable guarantee.

## Core company and contact claims

| Claim | Status | Evidence required | Approved wording / limitation |
|---|---|---|---|
| Hermes Logistics provides logistics coordination and dispatch support in the United States. | Qualified | Current operating scope, service agreement, contact routes | Use “dispatch support,” “coordination,” “review,” or “operating support.” Do not imply Hermes is the motor carrier unless separately verified. |
| Public Logistics Sales telephone is +1 (262) 302-3626. | Approved | Current public contact configuration | This is the only approved public `tel:` target until the register is updated. |
| Logistics Sales email is freight_301@hermeslogisticsus.com. | Approved | Current site and Workspace configuration | May appear on logistics pages. |
| General Hermes coordination email is officeus@hermeslogisticsus.com. | Approved | Current site and Workspace configuration | May appear on ecosystem, marketing, academy, technology, and contact pages. |
| Hermes serves every U.S. state. | Pending evidence | Verified current service-area evidence and operating capacity | Do not use “all 48 states,” “nationwide coverage,” or equivalent absolute wording until supported. |
| Hermes owns trucks, trailers, warehouses, or terminals. | Prohibited | Ownership evidence and business approval would be required | Do not imply asset ownership. Describe third-party carrier capacity and customer-specified facilities accurately. |

## Carrier and dispatch claims

| Claim | Status | Evidence required | Approved wording / limitation |
|---|---|---|---|
| Hermes reviews MC/USDOT, authority, insurance, equipment, contact, and availability information during onboarding. | Qualified | Current onboarding workflow and required-field list | Use “reviews,” “requests,” or “checks.” Do not say the review independently certifies identity, safety, or legal compliance. |
| Hermes may search, evaluate, negotiate, coordinate, and support documentation for loads. | Qualified | Current service scope and agreement | State that the carrier controls the final decision and approves each load. |
| Hermes guarantees loads, weekly gross, rates, lanes, or revenue. | Prohibited | Not applicable | Never publish guarantees of freight, income, rates, weekly gross, dedicated lanes, or business results. |
| Hermes can develop direct-shipper or dealer relationships over time. | Qualified | Active process and responsible team | Use “researches,” “develops,” “works toward,” or “builds a pipeline.” Do not promise a customer or timeline. |
| A carrier automatically joins the Trusted Carrier Network after a fixed period. | Prohibited | Not applicable | Qualification is conditional; time alone never guarantees acceptance. |
| Carrier onboarding creates an account or approves the carrier automatically. | Prohibited | Not applicable | Use “submission begins review” and “approval is not automatic.” |
| The carrier makes the final booking and operating decision. | Approved | Service model | Include on dispatch and carrier-facing commercial pages where booking authority could be misunderstood. |

## Vehicle transport and customer claims

| Claim | Status | Evidence required | Approved wording / limitation |
|---|---|---|---|
| Hermes coordinates vehicle transport requests with suitable carrier capacity. | Qualified | Current intake and carrier review process | Use “coordinates,” “reviews,” and “seeks suitable capacity.” Do not imply automatic acceptance. |
| Hermes guarantees price, pickup date, delivery date, transit time, or capacity. | Prohibited | Not applicable | Every request remains subject to route, equipment, authority, insurance, access, market, and carrier approval. |
| Hermes can review open, enclosed, hotshot, multi-car, winch, and specialized equipment requirements. | Qualified | Verified operating knowledge and available review process | Describe as equipment-fit review, not guaranteed equipment availability. |
| Hermes provides customs brokerage or customs clearance. | Prohibited unless separately approved | License/partner agreement and exact scope | Port content must say customs matters are handled by authorized parties. |
| Hermes provides warehousing or owns a storage facility. | Prohibited unless separately approved | Facility contract/ownership and service scope | “Storage facility” may describe a customer-selected third-party destination only. |
| Hermes guarantees damage-free transport. | Prohibited | Not applicable | Explain condition documentation, insurance review, BOL/POD, and carrier responsibility without guaranteeing outcome. |
| Real inbound demand may be described publicly. | Qualified | Source record and privacy review | Label as “real inbound request” or “example of direct inbound demand”; remove names, VINs, phone numbers, exact addresses, and documents; never claim completion without evidence. |

## Broker claims

| Claim | Status | Evidence required | Approved wording / limitation |
|---|---|---|---|
| Hermes can review broker opportunities and seek qualified carrier capacity. | Qualified | Current broker collaboration workflow | State that capacity is verified before commitment and is not guaranteed. |
| Hermes replaces broker-carrier contracts or accepts freight automatically. | Prohibited | Not applicable | Preserve broker and carrier contracting responsibilities. |
| Hermes guarantees repeated-lane capacity. | Prohibited | Not applicable | Use “capacity research,” “fit review,” and “potential repeat-lane development.” |

## Academy claims

| Claim | Status | Evidence required | Approved wording / limitation |
|---|---|---|---|
| Hermes Business Academy provides practical learning and simulated or supervised practice. | Qualified | Current curriculum and delivery method | State the exact program, dates, scope, price, and practice boundaries before enrollment. |
| Training guarantees employment, income, promotion, certification, or client acquisition. | Prohibited | Not applicable | Never guarantee job placement or earnings. |
| Student counts, placement rates, salary outcomes, or employer partnerships. | Pending evidence | Auditable records and methodology | Do not publish numerical social proof without evidence and approval. |

## Marketing and SEO claims

| Claim | Status | Evidence required | Approved wording / limitation |
|---|---|---|---|
| ProgressoPro provides website, SEO, content, social media, and growth-system services. | Qualified | Current offer and delivery scope | Describe concrete deliverables; avoid ranking or revenue guarantees. |
| SEO guarantees first position, traffic, leads, or sales. | Prohibited | Not applicable | Use testing, implementation, measurement, and improvement language. |
| Historical performance examples may be used. | Qualified | Platform exports, dates, account context, and privacy permission | Label the source period and avoid implying identical future results. |

## Technology claims

| Claim | Status | Evidence required | Approved wording / limitation |
|---|---|---|---|
| Hermes IT Development builds websites, CRM, automation, AI assistants, portals, and operational prototypes. | Qualified | Current capability and project evidence | Label each item accurately as live product, working prototype, local preview, build-ready capability, or planned work. |
| A prototype is a live production service. | Prohibited | Not applicable | Keep prototypes `noindex` unless they become approved standalone products; visibly state what is not connected. |
| An AI assistant acts autonomously on customer data, payments, calendars, accounts, or external systems. | Pending evidence | Production integration, permissions, security review, and operating controls | Do not imply live actions where the current product is simulated or local. |

## Structured-data rules

1. Organization, WebSite, Service, FAQPage, BreadcrumbList, ContactPoint, and other schema must represent visible page content.
2. Do not add `LocalBusiness` without a verified public physical business location and appropriate scope.
3. Do not use ratings, reviews, offers, prices, availability, service areas, employee counts, founding dates, or awards without evidence.
4. Every schema URL must use the canonical HTTPS host.
5. FAQ structured data must repeat visible questions and answers accurately.
6. Schema must not turn qualified language into an absolute claim.

## Analytics and privacy rules

- Allowed events: contact method, page path, CTA category, audience category, successful consented submission state.
- Prohibited payloads: name, email, telephone, VIN, MC/USDOT, exact route, exact address, document text, free-form message, customer identity, rate confirmation, credentials.
- Do not put private data into URL parameters, analytics labels, error telemetry, or public logs.

## Page review workflow

For each new or materially changed page:

1. Copy every factual commercial statement into this register or a page-specific evidence appendix.
2. Assign Approved, Qualified, Pending evidence, or Prohibited.
3. Link the evidence source privately; do not commit confidential evidence to the public repository.
4. Rewrite qualified claims with scope and decision boundaries.
5. Remove pending or prohibited claims before review.
6. Confirm visible copy, metadata, schema, FAQ, CTA, and localization remain consistent.
7. Record reviewer and review date in the pull request or internal release log.
