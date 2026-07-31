# Hermes SEO Conversion Copy Matrix

This matrix keeps calls to action aligned with the visitor's search intent and with the actual state of each workflow. Use direct phone and email fallbacks whenever a form or integration is in preview mode.

## Shared CTA rules

- CTA text must describe the next real action, not a result that is not guaranteed.
- Avoid generic labels such as “Learn more” when a more descriptive action is available.
- Do not say `Book now`, `Get a guaranteed quote`, `Find guaranteed loads`, or `Get approved instantly` unless the complete live workflow and evidence exist.
- A preview form must say that it does not send or store data.
- Live forms must require explicit consent and provide a visible success or failure state.
- Analytics events may record CTA type, audience, and page path only; never include PII or route details.

## Carrier and owner-operator

### Primary CTA variants

- `Start carrier onboarding`
- `Request a carrier fit review`
- `Share your current capacity`
- `Ask Logistics Sales about dispatch support`
- `Prepare your MC, equipment, and availability details`

### Secondary CTA variants

- `Call Logistics Sales`
- `Email carrier details securely`
- `Review the carrier onboarding checklist`
- `See the car-hauler capacity checklist`

### Required boundary near CTA

`Submission begins a review. It does not approve a carrier, create an account, guarantee a load, or guarantee a rate.`

## Fleet owner

### Primary CTA variants

- `Request a fleet operating review`
- `Discuss multi-truck dispatch controls`
- `Share fleet equipment and availability`
- `Review a fleet support path`

### Secondary CTA variants

- `Call about fleet operations`
- `See the fleet-owner path`
- `Prepare truck-by-truck availability`

### Required boundary near CTA

`Fleet support depends on authority, insurance, equipment, team responsibilities, and current operating fit.`

## Shipper

### Primary CTA variants

- `Prepare a transport request`
- `Submit a route for review`
- `Request a vehicle transport review`
- `Share pickup, delivery, timing, and cargo details`

### Secondary CTA variants

- `Call Logistics Sales`
- `Email a transport request`
- `Review the transport intake checklist`

### Required boundary near CTA

`A request does not guarantee price, pickup timing, delivery timing, or carrier availability.`

## Dealer and auction buyer

### Primary CTA variants

- `Prepare a dealership transport request`
- `Request auction-to-dealer coordination`
- `Share a multi-vehicle movement for review`
- `Discuss repeat dealership lanes`

### Secondary CTA variants

- `Review the auction pickup checklist`
- `Call about dealer inventory transport`
- `Email release and timing details securely`

### Required boundary near CTA

`Release status, vehicle condition, access rules, equipment fit, and carrier approval are reviewed before confirmation.`

## Private vehicle customer

### Primary CTA variants

- `Request a vehicle transport review`
- `Prepare your pickup and delivery details`
- `Discuss a special vehicle move`
- `Ask about open or enclosed transport`

### Secondary CTA variants

- `Call Logistics Sales`
- `Email vehicle details privately`
- `Review what information is needed`

### Required boundary near CTA

`Do not place VINs, exact addresses, or private documents in a public URL or analytics field.`

## Luxury and classic vehicle customer

### Primary CTA variants

- `Discuss a special vehicle move`
- `Request an enclosed-transport fit review`
- `Share handling requirements privately`
- `Prepare a low-clearance or non-running vehicle review`

### Secondary CTA variants

- `Call about specialized handling`
- `Email private condition details`
- `Compare open and enclosed considerations`

### Required boundary near CTA

`Equipment and carrier availability are reviewed individually. Damage-free transport and exact dates are not guaranteed.`

## Port or airport pickup customer

### Primary CTA variants

- `Prepare a port pickup request`
- `Review release and terminal access details`
- `Request port-to-destination coordination`
- `Share storage deadline and vehicle condition privately`

### Secondary CTA variants

- `Call about port pickup requirements`
- `Email release information securely`
- `Review the port pickup checklist`

### Required boundary near CTA

`Hermes does not represent itself as a customs broker, port authority, or warehouse unless a separate verified service is approved.`

## Freight broker

### Primary CTA variants

- `Discuss a carrier capacity requirement`
- `Submit a lane for capacity review`
- `Share equipment and timing requirements`
- `Request a repeated-lane capacity review`

### Secondary CTA variants

- `Call Logistics Sales`
- `Email broker opportunity details securely`
- `Review the carrier qualification process`

### Required boundary near CTA

`Capacity is verified before commitment. A request does not create an automatic booking or replace broker-carrier contracts.`

## Driver candidate

### Primary CTA variants

- `Start a logistics application`
- `Share your driving experience`
- `Review the current career path`
- `Explore training before applying`

### Secondary CTA variants

- `Prepare your experience and availability`
- `Ask about the application process`
- `Review Academy options`

### Required boundary near CTA

`An application or training program does not guarantee employment, income, promotion, or placement.`

## Academy applicant

### Primary CTA variants

- `Ask about the right Academy path`
- `Review the program requirements`
- `Request current dates, scope, and pricing`
- `Explore practical learning options`

### Secondary CTA variants

- `Email the Academy team`
- `Compare the available programs`
- `Review the practice boundaries`

### Required boundary near CTA

`Program dates, price, scope, and participation requirements must be confirmed before enrollment. Outcomes are not guaranteed.`

## Marketing client

### Primary CTA variants

- `Request a website and growth review`
- `Discuss the next campaign system`
- `Ask about SEO and content operations`
- `Prepare a marketing project brief`

### Secondary CTA variants

- `Email ProgressoPro`
- `Review the marketing operating system`
- `See the website audit preview`

### Required boundary near CTA

`SEO, reach, leads, rankings, revenue, and campaign performance cannot be guaranteed.`

## Technology client

### Primary CTA variants

- `Prepare a technology project brief`
- `Discuss the system you want to build`
- `Request a CRM and automation review`
- `Define a first prototype scope`

### Secondary CTA variants

- `Email Hermes IT Development`
- `Review working product previews`
- `Describe the business process to improve`

### Required boundary near CTA

`Prototype, preview, build-ready capability, and live production product must be labeled accurately. No unconnected action should be presented as live.`

## Recommended GA4 event contract

```text
contact_click
  method: phone | email
  audience: carrier | fleet_owner | shipper | dealer | customer | broker | candidate | academy | marketing | technology
  page_path: pathname only

cta_click
  cta_group: onboarding | transport_request | capacity_review | application | consultation | project_brief
  audience: approved audience enum
  page_path: pathname only

lead_submit
  lead_type: approved non-PII category
  status: success | validation_error | delivery_error
  page_path: pathname only
```

Never send names, phone numbers, emails, addresses, routes, VINs, authority numbers, free-form messages, document contents, or rates in analytics events.
