# Hermes regional privacy launch-gate matrix — 2026-08-11

Status: `OPERATIONAL REVIEW MATRIX / REVERIFY BEFORE LAUNCH`  
Parent: #321  
Purpose: convert the public `/regional-privacy/` boundary into an implementation gate for new markets, analytics, advertising, vendors and data flows. This is an operational checklist, not legal advice and not a claim that every listed law applies to every Hermes direction.

## Core rule

A market being technically reachable does not equal intentional market targeting. Before enabling a market-specific campaign, paid acquisition, account flow, new analytics/advertising technology, payment flow, sensitive-data collection or new processor/data transfer, identify the actual Hermes entity/service, audience, data categories, processing purposes and vendors, then re-check the current official rule for that activity.

Keep the current conservative baseline unless a reviewed launch package says otherwise:

- optional GA4 only after the existing affirmative analytics choice;
- advertising storage, ad user data and ad personalization remain disabled by default;
- no Meta Pixel, remarketing, audience matching, fingerprinting or parallel advertising tag merely because analytics was accepted;
- ordinary public forms should not collect passwords, payment credentials, Social Security numbers, identity documents or other sensitive records unless a dedicated secure workflow is approved;
- no private form values in analytics parameters, public URLs or public debugging output.

## Launch matrix

| Market / regime | Trigger to review | Minimum pre-launch gate | Current Hermes default | Official source checkpoint |
| --- | --- | --- | --- | --- |
| California / CCPA | For-profit business doing business in California and meeting a current statutory threshold; also review sale/share, sensitive information and cross-context behavioral advertising separately | Confirm applicability; notice at or before collection where required; privacy-policy rights/methods; working request process; if covered sale/share occurs, implement required opt-out and honor valid GPC signals; do not treat analytics consent as advertising/share consent | `HOLD_TARGETED_ADS_AND_SALE_SHARE_UNTIL_APPLICABILITY_REVIEW` | California DOJ CCPA: https://oag.ca.gov/privacy/ccpa |
| Texas / TDPSA | Business conducted in Texas or product/service consumed by Texas residents while processing consumer personal data, subject to statutory exemptions; small-business exception must be assessed rather than assumed | Map controller/processor role and exemptions; consumer-rights process; sensitive-data and targeted-advertising/sale/profiling review; processor/vendor contracts as applicable | `REVIEW_BEFORE_MATERIAL_TEXAS_DATA_CHANGE` | Texas Attorney General TDPSA: https://www.texasattorneygeneral.gov/consumer-protection/file-consumer-complaint/consumer-privacy-rights/texas-data-privacy-and-security-act |
| Colorado / CPA | Covered controller plus sale of personal data or targeted advertising, or other covered processing under the CPA | Confirm applicability; rights/notice process; if covered sale/targeted advertising occurs, implement recognized Universal Opt-Out Mechanism handling and explain it in privacy policy; current Colorado AG guidance recognizes GPC | `NO_CROSS_SITE_TARGETING_UNTIL_UOOM_REVIEW` | Colorado Attorney General UOOM/GPC: https://coag.gov/opt-out/ |
| Other U.S. privacy states | Intentional state-targeted workflow or material change in collection/use, especially sale, targeted advertising, profiling, sensitive data or consumer-rights handling | Re-check the current state statute/regulations before launch; classify notice, access/correction/deletion/portability, opt-out/appeal, sensitive-data consent, UOOM, retention and processor-contract requirements | `STATE_REVIEW_REQUIRED_BEFORE_NEW_REGULATED_USE` | Use the relevant state AG/regulator and statutory text; do not extrapolate California to all states |
| EU / EEA GDPR | Non-EU organization intentionally offers goods/services to individuals in the EU/EEA or monitors their behavior there; EU establishment can also create scope | Document controller/processor roles, purposes and lawful bases, notices, rights handling, retention, processors, transfer mechanism and security; assess representative, DPO and DPIA requirements for the actual processing | `NO_INTENTIONAL_EU_TARGETING_WITHOUT_GDPR_LAUNCH_REVIEW` | European Commission: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/application-gdpr_en |
| United Kingdom / UK GDPR + PECR | Organization outside UK intentionally offers goods/services to people in the UK or monitors behavior there; storage/access technologies require a separate PECR review | Confirm UK GDPR scope and role; review privacy notice/rights/retention/vendors/transfers; assess UK representative if required; for cookies/pixels/local storage/device access, obtain the consent required by current PECR guidance unless a specific exemption applies | `NO_UK_ADTECH_WITHOUT_UK_GDPR_PECR_REVIEW` | ICO scope: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/personal-information-what-is-it/who-does-the-uk-gdpr-apply-to/ ; ICO cookies: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/ |
| Cross-border vendors / transfers | A new provider receives or can access personal information across relevant jurisdictional borders | Record provider, data, purpose, role, storage/processing location where known, retention, security, subprocessor and transfer terms; do not activate solely because integration is technically available | `VENDOR_TRANSFER_REVIEW_REQUIRED` | EU Commission / ICO transfer guidance plus the applicable market regulator |

## Current official-source facts used for the 2026-08-11 checkpoint

### California

The California Attorney General currently describes CCPA coverage for a for-profit business doing business in California that meets at least one listed threshold: gross annual revenue over $25 million; buying, selling or sharing personal information of 100,000 or more California residents or households; or deriving 50% or more of annual revenue from selling California residents' personal information. The same official guidance describes notice-at-collection and privacy-policy duties for covered businesses and states that valid GPC opt-out signals must be honored for covered sale/share activity.

Operational rule: do **not** mark Hermes `CCPA_APPLIES` or `CCPA_EXEMPT` from website traffic alone. The relevant entity's current revenue/data-volume/business-model facts must be checked privately before that classification is made.

### Texas

The Texas Attorney General states that the TDPSA is effective July 1, 2024 and generally applies to companies conducting business in Texas or producing a product/service consumed by Texas residents while processing consumers' personal data, subject to exemptions. The AG also states that small businesses as defined by the SBA are generally exempt, except a small business that sells sensitive consumer data must first obtain consent.

Operational rule: do not use “small company” as a casual exemption label. Check the actual statutory/SBA status and the exact data practice before relying on an exemption.

### Colorado

Colorado Attorney General guidance states that covered businesses must allow consumers to opt out of sale of personal data or targeted advertising through a recognized Universal Opt-Out Mechanism and identifies Global Privacy Control as the currently recognized mechanism. The guidance also says the privacy policy must explain how UOOM requests are processed.

Operational rule: a future advertising stack must include UOOM/GPC handling in the Colorado launch review rather than bolting it on after campaigns are live.

### EU / EEA

European Commission guidance states that GDPR can apply to an organization established outside the EU when it offers goods/services, paid or free, to individuals in the EU or monitors their behavior there. Mere global availability is not the same operational decision as intentionally targeting the EU.

Operational rule: language targeting, campaign settings, service availability, enrollment/payment flows and behavioral tracking should be assessed together before calling an EU market “launched.”

### United Kingdom

ICO guidance says UK GDPR can apply to organizations outside the UK that offer goods/services to individuals in the UK. ICO cookie/storage guidance currently states that people must be informed about cookies or similar storage/access technologies and that consent is generally required unless a relevant exemption applies. ICO also notes some guidance is under review following the Data (Use and Access) Act, so this row must be re-checked immediately before a UK launch rather than treated as permanently frozen.

## Required implementation record for a new market or regulated feature

Create one launch record containing:

`launch_id | service/entity | country/state | audience | feature/campaign | data_categories | purposes | analytics | advertising | sale/share | sensitive_data | profiling | processors | transfers | retention | notice | consent_or_optout | rights_process | security_owner | legal_review_state | production_verification | launch_decision | reviewed_at | next_review`

Allowed launch decisions:

- `APPROVED_FOR_CURRENT_SCOPE`
- `APPROVED_WITH_CONTROLS`
- `HOLD_DATA_MAPPING`
- `HOLD_VENDOR_REVIEW`
- `HOLD_CONSENT_OR_OPTOUT`
- `HOLD_PAYMENT_TERMS`
- `HOLD_LEGAL_REVIEW`
- `NOT_TARGETING_THIS_MARKET`

## Advertising-tech gate

Before Meta Pixel, Google Ads remarketing, Customer Match/audience upload, a GTM advertising container, third-party cross-site retargeting or equivalent technology is enabled:

1. identify every tag/storage/access behavior and recipient;
2. classify whether the activity is analytics, advertising, sale/share, targeted advertising or profiling in each targeted market;
3. update notice and consent/opt-out design for that actual use;
4. implement applicable GPC/UOOM behavior before launch where required;
5. prevent activation before the required user choice;
6. verify network behavior in production with a clean browser state;
7. confirm no submitted lead/contact/route/vehicle/MC/USDOT/message data enters ad-tech payloads;
8. document rollback owner and re-review date.

Until this package exists, advertising technology remains `OFF_BY_DEFAULT`.

## Vendor / international-transfer gate

For every new material provider, record the data categories, purpose, controller/processor/service-provider role, subprocessors where material, processing/storage geography where available, contract/DPA state, retention/deletion controls, security review and the transfer mechanism or exception required for the target market. A vendor's marketing statement that it is “GDPR compliant” or “CCPA compliant” does not replace Hermes's own role/use-case review.

## Re-review triggers

Re-run this matrix when any of the following changes:

- new country/state campaign or localized paid acquisition;
- new login/account/profile flow;
- new payment/subscription/recurring billing flow;
- new analytics, pixel, tag manager, fingerprinting or audience-matching technology;
- new CRM/email/SMS/call/AI/document processor;
- collection of precise location, government ID, financial credentials, health/biometric or other sensitive data;
- sale/share/targeted-advertising/profiling use changes;
- regulator guidance or law changes;
- corporate/entity or contracting relationship changes.

## Boundary

This matrix deliberately avoids claiming that one privacy law applies everywhere, that every Hermes direction is the same legal entity, or that a generic cookie banner solves state/international compliance. High-risk or uncertain applicability, sensitive-data, behavioral advertising, recurring-payment and cross-border-transfer decisions should be reviewed by qualified counsel for the exact business/entity/workflow before launch.
