# Payment Launch Gate

No Hermes website payment, checkout, paid enrollment, deposit, subscription, automatic renewal, or card collection may be enabled until the specific selling workflow has an approved payment configuration.

## Required before launch

1. **Seller identity** — exact legal entity receiving payment, public business/contact information, and the service direction covered by that entity.
2. **Offer and price** — what the customer is buying, currency, taxes or fees if applicable, one-time vs recurring structure, billing interval, and any trial or deposit terms.
3. **Fulfillment** — what Hermes must deliver, expected timing, customer dependencies, and when performance begins.
4. **Cancellation** — whether and how an order, appointment, enrollment, subscription, or service may be cancelled, including any cutoff or notice period.
5. **Refund policy** — refund eligibility, exclusions, partial-refund rules if any, refund method, and processing expectations. Do not publish invented terms merely to satisfy this gate.
6. **Recurring billing** — if applicable, clearly disclose renewal frequency, amount or pricing method, how consent is captured, how renewal may be stopped, and how cancellation becomes effective.
7. **Payment processor** — approved processor, hosted/payment-tokenization model, merchant-of-record status if applicable, processor privacy/security terms, and which payment data Hermes can actually access.
8. **Privacy and security** — update the Privacy Policy/Notice at Collection for payment-related categories and providers; Hermes-hosted systems must not collect raw card credentials unless a separately approved PCI-compliant architecture requires it.
9. **Terms hierarchy** — identify the Terms of Sale/Service or signed agreement that controls the transaction and how it interacts with general website Terms of Use.
10. **Receipts and support** — customer receipt/confirmation route, billing descriptor if relevant, and support/contact route for billing issues.
11. **Regional review** — identify the customer markets targeted by the paid offer and review any applicable consumer, recurring-billing, tax, privacy, cancellation, or disclosure requirements before launch.
12. **Evidence and testing** — test the complete purchase, cancellation, failure, duplicate-submit, refund/support, privacy, and receipt paths before production activation.

## Current state

As of 2026-08-10, this gate does not authorize any payment flow. A future payment integration must explicitly satisfy the items above and add automated production-safety checks before becoming live.
