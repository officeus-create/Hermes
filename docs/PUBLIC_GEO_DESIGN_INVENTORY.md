# Public Hermes GEO + Design Inventory

Status: ACTIVE — source-driven public-site convergence
Owner: GEO/public website workstream
Canonical base when this inventory was introduced: `main`

## Scope boundary

This workstream owns the **public Hermes website** for:

- GEO / AI answer readiness;
- public truth, evidence and entity clarity;
- public brand consistency;
- final convergence to the approved Hermes Design OS;
- desktop + 390px public QA;
- public accessibility and duplicate/legacy classification.

This workstream does **not** own Hermes Connect product code.

`src/pages/services/hermes-connect/**` is classified `connect_owner_excluded`. Auth/session, workspaces, booking, CRM, D1, private Academy/Beauty and Connect product logic are not modified here. Cross-boundary findings are recorded as dependencies.

`src/pages/demos/**` is classified `demo_lab_excluded`. Demo/lab routes are not canonical public production owners and must not supply production visual assets.

## Canonical inventory

The canonical route inventory is executable, not a manually maintained page count:

```bash
node scripts/public-geo-design-inventory.test.mjs --json
```

The script walks every `src/pages/**/*.astro` source and emits one row per route source with:

- `source`
- `route`
- `family`
- `purpose`
- `ownership`
- `indexability`
- `designGeneration`
- `brandGeneration`
- `headerGeneration`
- `footerGeneration`
- `palette`
- `mobileState`
- `geoStatus`
- `duplicateCandidate`
- `action`

Because dynamic Astro routes can generate multiple URLs, the inventory intentionally records **route source patterns** rather than pretending every generated URL has already received a manual visual review.

The inventory contract is also imported by `scripts/validate-build-current.mjs`, so it participates in the existing `npm test` chain.

## Families

| Family | Examples | Ownership | Current action |
| --- | --- | --- | --- |
| Home | `/` | public GEO/design | Preserve approved Home architecture; audit truth, assets, accessibility and controlled legacy accents. |
| Four Directions | `/paths/logistics/`, `/paths/marketing/`, `/paths/academy/`, `/paths/technology/` and path detail sources | public GEO/design | Make MOVE / GROW / LEARN / BUILD read as one Hermes ecosystem. |
| Logistics | `/logistics/**` | public GEO/design | Audit commercial, informational, local and intake surfaces family-by-family; no page factory. |
| Logistics Resources | `/logistics/resources/**` | public GEO/design | Preserve the shared resource shell already converged on current main; reconcile evidence/GEO page-by-page. |
| Digital Services | `/services/**` except Hermes Connect | public GEO/design | Reuse current-main Digital Services RC where applicable; do not duplicate a second design branch. |
| Shared Resources | `/resources/**` | public GEO/design | Shared resource presentation is already converged on current main; continue GEO/truth review. |
| Academy public | `/academy/**`, `/ua/academy/**` public routes | public GEO/design | Public learning/apply pages only; authenticated Connect Academy is excluded. |
| Marketing public | `/business-growth/**`, localized equivalents | public GEO/design | GEO + Design OS review without creating a separate Marketing brand/site. |
| Cases | `/case/**` | public GEO/design | Use existing current-main case RC; validate evidence labels and public truth. |
| Careers | `/careers/**` | public GEO/design | Public JobPosting/search/truth/design review; no automated hiring decisions. |
| Trust / legal / company | About, contact, privacy, company, policy routes | public GEO/design | Unify trust presentation while preserving legal text and factual ownership. |
| Localized overviews | `/ua/`, `/ru/`, `/es/`, `/it/`, `/fr/` | public GEO/design | Current-main localized Design OS exists; verify GEO parity and language ownership. |
| Transactional public boundary | contract/signing surfaces | public transactional review | Audit presentation/truth/indexability only; do not change signing/execution logic. |
| Hermes Connect | `/services/hermes-connect/**` | **excluded** | Record dependency only. Connect owner changes product code. |
| Demo / lab | `/demos/**` | **excluded** | Verify noindex/lab status and prevent production asset dependency. |

## First concrete remediation

### Production asset hygiene

Before this inventory, Home and the shared Hermes Connect launcher loaded the Hermes Connect mark from:

`/demos/hermes-connect/icon-192.svg`

This mixed a production public shell with a demo namespace.

The public workstream now promotes the identical mark to:

`/images/hermes-connect-mark.svg`

and switches public/shared presentation references to that production asset path. This is a source-path hygiene fix only; it does not redesign the mark or change Connect business/product behavior.

The inventory contract rejects future visual asset dependencies from `/demos/` in production `src/pages` / `src/components` source.

## Current known review items

1. **Home** is an approved baseline and must not receive another concept redesign. It currently contains direction-spectrum magenta/gold accents alongside violet/ocean. These are recorded for CEO visual review rather than silently changed.
2. `WebsiteProofBand.astro` still contains historical Hermes Connect `Product discovery` concept copy. Current repository search does not show it as a rendered page import, so it is a legacy-component candidate rather than a reason to edit Connect. If it becomes reachable from a public route, its public truth must be reconciled first.
3. Existing current-main Draft visual RCs for Logistics commercial directory, Trust, Contact, Carrier Entry, Cases, Calculators and Digital Services must be reused rather than duplicated. They remain visual-approval gated.
4. Resources and five localized overviews already have their current-main design convergence merged. GEO/truth review continues on top of those surfaces; no second redesign is needed.

## Page review checklist

Every public-owned route is reviewed in this order:

1. What is this page and who owns it?
2. Who is Hermes / what is offered / for whom / where / how?
3. What facts and relationships are actually supportable?
4. Can an AI answer engine extract a concise, correct answer without inventing context?
5. Are evidence/source/entity blocks appropriate and bounded?
6. Is the next action clear without changing another workstream's product logic?
7. Does the surface use one Hermes brand hierarchy and current public Design OS?
8. Are header/footer/logo/breadcrumb/button/card/form grammars consistent?
9. Are there legacy palette/template/demo dependencies or duplicate families?
10. Desktop QA.
11. 390px QA and overflow/readability/focus/reduced-motion checks.
12. If the visible composition materially changes: immutable Preview → CEO visual approval → only then merge.

## Stop rules

- No Hermes Connect product changes from this workstream.
- No SEO keyword experiment or SEO rewrite merely because GEO is being audited.
- No fabricated customers, metrics, revenue, rankings, citations, AI mentions, availability or outcomes.
- No bulk location/equipment/service page creation without distinct demand, factual value and measurement justification.
- No claim that engineering success proves indexing, ranking, AI recommendation or commercial success.
- No material public visual merge before CEO visual approval.

## Definition of completion

A public family reaches 100% only when its canonical routes have:

- ownership and duplicate status classified;
- GEO/truth/evidence review complete;
- one Hermes brand/design grammar;
- no accidental production dependency on demo assets;
- desktop and 390px verification;
- accessibility/reduced-motion/overflow verification;
- required material visual approval;
- exact-head CI green.

External search/AI/analytics evidence remains a separate requirement before GEO itself can be described as fully proven in the market.
