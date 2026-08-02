# Marketing SEO Scorecard Data Dictionary

| Field | Type | Required | Meaning |
|---|---|---:|---|
| reporting_period | YYYY-MM-DD or range | yes | Snapshot date or reporting window |
| page_url | URL | yes | Canonical landing-page URL |
| page_group | enum | yes | Controlled commercial/content group |
| publication_date | YYYY-MM-DD/null | yes | Verified production publication date |
| sitemap_owner | string/null | yes | Exactly one declared sitemap |
| indexability | index/noindex/unknown | yes | Current production directive |
| canonical_status | verified/conflict/unknown | yes | Canonical validation state |
| inspection_state | not_requested/requested/indexed/not_indexed/unknown | yes | URL Inspection workflow state |
| impressions | integer/null | yes | Search Console impressions |
| clicks | integer/null | yes | Search Console clicks |
| ctr | decimal/null | yes | clicks/impressions when source reports or inputs permit |
| average_position | decimal/null | yes | Search Console average position |
| landing_sessions | integer/null | yes | GA4 landing sessions |
| engaged_sessions | integer/null | yes | GA4 engaged sessions |
| engagement_rate | decimal/null | yes | engaged_sessions/landing_sessions |
| cta_event_count | integer/null | yes | Privacy-safe CTA event count |
| cta_type | enum/null | yes | Stable CTA taxonomy |
| qualified_inquiry_count | integer/null | yes | Aggregate reviewed inquiries only |
| session_to_cta_rate | decimal/null | yes | CTA events/landing sessions |
| cta_to_qualified_rate | decimal/null | yes | Qualified inquiries/CTA events |
| data_source | string | yes | Search Console, GA4, reviewed aggregate, or registry |
| source_property | string/null | yes | Exact property/view identifier without secrets |
| source_timestamp | ISO-8601/null | yes | Extraction time |
| timezone | IANA timezone/null | yes | Source timezone |
| owner | string | yes | Accountable role/person |
| blocker | string/null | yes | Current impediment |
| next_action | string | yes | Concrete next step |
| review_due | YYYY-MM-DD/null | yes | Next review date |
| status | enum | yes | VERIFIED, PARTIAL, PENDING_CONNECTION, NOT_AVAILABLE, NEEDS_REVIEW |

## CTA taxonomy

- primary_inquiry
- email_contact_click
- phone_click
- academy_interest_preview
- logistics_request_preview
- carrier_cta
- dealer_shipper_cta
- case_study_cta
- resource_to_commercial_click

## Privacy rule

Analytics parameters and scorecard rows may contain page, page group, CTA type, timestamp bucket and aggregate counts. They must not contain names, email addresses, phone numbers, free-form messages, company identifiers, MC/DOT, VIN, exact addresses, shipment identifiers, rates, commissions, documents or credentials.
