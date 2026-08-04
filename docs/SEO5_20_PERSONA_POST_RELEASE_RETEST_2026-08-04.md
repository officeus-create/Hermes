# SEO-5 Post-Release Secret Shopper Retest — 20 Personas

Status: `REPOSITORY / RENDERED-EXPERIENCE AUDIT — PRODUCTION METRICS PENDING`  
Audit date: 2026-08-04  
Baseline: current `main` after the direct commercial-intake, production inquiry-delivery, homepage role-routing, engagement-clarity, objection-coverage, analytics-registry, and qualified-inquiry-definition releases through PR #215.

Open PRs are not counted as released behavior in this scorecard.

## Evidence boundary

This retest evaluates:

- current route and content architecture;
- visible commercial paths;
- rendered desktop/mobile workflow contracts;
- form and fallback structure;
- evidence, claim, privacy, and decision boundaries;
- likely buyer comprehension and friction.

It does not establish:

- production traffic or search demand;
- rankings, impressions, clicks, CTR, or indexed status in Search Console;
- GA4 event collection or conversion rates;
- confirmed real inquiry volume or qualification rate;
- response time, close rate, revenue, retention, or ROI;
- real-user Core Web Vitals;
- independent customer preference or recommendation.

Those outcomes remain governed by Issue #206.

## Scoring method

Each persona receives a heuristic score from 1 to 10:

- `1–3` — wrong path, material trust loss, or unusable next step;
- `4–5` — discoverable but weak, ambiguous, or proof-poor;
- `6–7` — usable and credible with meaningful remaining friction;
- `8–9` — clear, direct, and operationally useful; production evidence still required;
- `10` — reserved for a path supported by strong independent proof, measured task completion, reliable production conversion evidence, and no material unresolved objection.

The score is a diagnostic, not a market claim.

---

# Executive result

## Post-release direction scores

| Direction | Initial SEO-4 score | Post-release heuristic | Change | Remaining primary constraint |
| --- | ---: | ---: | ---: | --- |
| Carrier / owner-operator | 5/10 | 8/10 | +3 | Named proof, real carrier case, pricing/contract evidence, production funnel baseline |
| Dealer / auction / vehicle transport | 6/10 | 8/10 | +2 | Real movement case, approved capacity/response evidence, production qualification baseline |
| Shipper / logistics manager / broker | 6/10 | 7/10 | +1 | Legal/operating-role clarity, customer proof, escalation ownership, external authority signals |
| Logistics SEO buyer | 5/10 proof; 7/10 expertise | 7/10 overall | +1–2 | Named reviewer, sample deliverable, Search Console/GA4 evidence, external client case |
| Homepage role routing | 6/10 | 8/10 | +2 | External entity confidence and proof before high-consideration decisions |
| Trust and proof | 4/10 | 6/10 | +2 | Real people, permissioned cases, testimonials, legal/company facts, independent citations |
| CTA and inquiry delivery | 3/10 | 8/10 | +5 | GA4 verification, receiver-to-human-review reconciliation, actual response ownership |
| Technical SEO | 9/10 | 9/10 | 0 | Production Search Console and field-performance reconciliation |
| AI recommendation readiness | 5/10 | 6/10 | +1 | External citations, accurate profiles, named experts, reviews, entity disambiguation |

## Money-loss conclusion

The largest direct conversion defects from the initial audit have been reduced:

- ready carriers no longer depend on the fictional Load Board for the primary commercial intake;
- customer/dealer vehicle transport has a direct qualified request path;
- the homepage has role-first routing;
- Logistics pages have final contextual CTAs and direct fallbacks;
- production website inquiry delivery is technically verified;
- carrier/dealer post-submit and exception expectations are visible;
- SEO, Marketing, Academy, and website buyers have clearer starting-scope/process language.

The main remaining loss is now **proof and measurement**, not missing pages:

1. no approved named Logistics expert or Academy instructor layer;
2. no permissioned carrier and dealer/customer cases with source evidence;
3. external profiles contain conflicting scale/location/service facts;
4. GA4 custom-event transport and privacy have not been authenticated;
5. delivered requests are not yet reconciled into a stable human-reviewed and qualified-inquiry baseline;
6. Search Console/Bing and field Core Web Vitals are still account-gated;
7. investor, journalist, partner, and AI-recommendation personas have insufficient independent entity evidence.

No new bulk location expansion should precede resolution of those constraints.

---

# Five-second tests

## 1. Carrier / owner-operator

**Entry:** `/logistics/car-hauling-dispatch/` or `/paths/logistics/carriers/owner-operators/`

**Five-second understanding:** Hermes offers car-hauling dispatch and back-office coordination for owner-operators/small fleets, while the carrier keeps the final booking decision.

**First useful action:** direct dispatch-review intake, not the fictional Load Board.

**Strongest trust signals:** equipment-aware scope, authority/insurance readiness, carrier approval boundary, written post-submit sequence, phone/email fallback.

**Remaining immediate objection:** “Who has actually used this, who will review me, what exact agreement/fee applies, and how quickly will a human respond?”

**Result:** pass for comprehension and commercial routing; proof/response evidence pending.

## 2. Dealer / auction buyer

**Entry:** `/logistics/dealer-vehicle-transportation/` or `/logistics/auction-vehicle-pickup/`

**Five-second understanding:** Hermes can review a real vehicle-movement request, including route, quantity, operability, timing, release/access context, and transport preferences.

**First useful action:** direct vehicle-transport request workspace.

**Strongest trust signals:** explicit no-booking/no-capacity/no-rate guarantee; facility/release/condition guidance; carrier-review categories; issue and document boundaries.

**Remaining immediate objection:** “Show me a completed dealer/auction movement, the responsible contact, and evidence of how exceptions were handled.”

**Result:** pass for request clarity; real movement proof and operational response evidence pending.

## 3. Shipper / logistics manager

**Entry:** `/paths/logistics/shippers-dealers/`, `/logistics/shipper-dealer/`, or relevant transport page.

**Five-second understanding:** Hermes can coordinate information, request qualification, carrier-review categories, documents, and communication while the actual carrier retains transportation responsibility.

**First useful action:** direct transport request for vehicle movements or the appropriate Logistics contact path for broader freight context.

**Strongest trust signals:** carrier-review explanation, role boundaries, direct contact, privacy-safe intake.

**Remaining immediate objection:** exact legal/operating role, escalation owner, broader non-vehicle scope, customer proof, response expectations.

**Result:** partial pass; strongest for vehicle transport, less complete for broader managed logistics procurement.

## 4. Logistics SEO buyer

**Entry:** `/services/seo-for-logistics-companies/` or `/services/seo/`

**Five-second understanding:** Hermes/ProgressoPro offers logistics-specific SEO diagnostics and implementation tied to commercial pages, search intent, conversion paths, and measurement rather than generic blog volume.

**First useful action:** choose a diagnostic/focused/ongoing starting scope and prepare an SEO intake.

**Strongest trust signals:** first-party Hermes implementation depth, technical methodology, evidence boundaries, no ranking/lead guarantee, engagement scope clarity.

**Remaining immediate objection:** no named reviewer, no public sample audit/deliverable, no authenticated Search Console/GA4 result, and no external permissioned client case.

**Result:** pass for expertise and scope; proof remains the purchase blocker.

---

# Twenty-persona audit matrix

| # | Persona | Likely entry and task | Five-second understanding | Main objection / proof expected | CTA and friction | Current blocker / abandonment risk | Next implementation or operating action | Severity | Score |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | ---: |
| 1 | New carrier | `/paths/logistics/carriers/new-authority/`; understand readiness and request help | New authorities can receive readiness/dispatch-scope review without a load guarantee | Authority-age reality, broker access, insurance/document requirements, responsible reviewer | Relevant support and intake are discoverable; long education path may precede action | No named reviewer/case; readiness state can still feel subjective | Merge only validated readiness decision guidance; add permissioned reviewer identity and aggregate readiness dispositions after measurement | Medium | 7/10 |
| 2 | Owner-operator | `/paths/logistics/carriers/owner-operators/` → direct car-hauling dispatch intake | Dispatch, load search, documents, invoicing, and carrier-controlled booking | Fee/scope, actual response owner, proof of workflow and outcome | Direct carrier intake and fallback are strong | No current public agreement example, real carrier case, or response baseline | Publish sanitized scope example and permissioned carrier process case; reconcile delivery-to-qualified funnel | High | 8/10 |
| 3 | Fleet owner | `/paths/logistics/carriers/fleet-owners/` or `/logistics/fleet-owner-dispatch-support/` | Multiple trucks can be profiled and coordinated while fleet management retains approval | Continuity, backup contact, reporting cadence, exception authority, private status handling | Commercial path exists; detailed plan language is still being strengthened in an open PR | Current released page is credible but not yet as explicit as the proposed written operating plan | Release only after full CI; later add sanitized operating-plan template with no private data | Medium | 7/10 |
| 4 | Experienced car hauler | `/logistics/car-hauling-dispatch/` | Hermes understands car-hauling equipment, route/deadhead, broker, setup, paperwork, and invoicing work | Evidence that the team understands high-friction loads and can communicate professionally | Direct intake is clear and no longer confused with Load Board demo | Limited named expertise and no permissioned experienced-carrier proof | Add one dated workflow case and named operational reviewer after approval | High | 8/10 |
| 5 | New-authority car hauler | `/logistics/new-authority-car-hauler-support/` and readiness checklist | New authority requires more than an active number; readiness depends on authority, insurance, equipment, documents, and decisions | “Am I ready now, and what exact dependency blocks me?” | Checklist/support path is useful; open decision-tree PR would reduce interpretation friction | No production readiness disposition data or named reviewer | Verify/merge decision tree; track aggregate ready/clarify/not-ready outcomes privately | Medium | 7/10 |
| 6 | Dealer | `/logistics/dealer-vehicle-transportation/` → direct request | Dealer moves can be reviewed by route, quantity, timing, operability, access, and transport type | Real dealer proof, carrier assignment process, insurance/condition/escalation ownership | Direct request is strong and relevant | No permissioned dealer case or confirmed response/qualification baseline | Publish one sanitized completed movement after consent; measure request-to-qualified rate | High | 8/10 |
| 7 | Auction buyer | `/logistics/auction-vehicle-pickup/` or Wisconsin auction path | Auction pickup requires release, buyer/stock context, storage deadline, access, keys, and condition readiness | Facility-specific competence, timing, storage risk, operability, actual capacity | Direct vehicle request captures useful context without demanding unsafe documents | No completed auction movement evidence; facility examples are non-affiliated and must stay so | Add permissioned auction checklist/example outcome; preserve no-affiliation language | High | 7/10 |
| 8 | Shipper | `/paths/logistics/shippers-dealers/` or Logistics contact | Hermes can qualify and coordinate a transport/freight request and review available carrier information | Exact authority/role, freight categories, coverage, escalation, proof | Vehicle transport path is direct; broader freight path may require contact interpretation | Stronger for vehicle moves than general freight procurement | Approve exact legal/operating-role statement and broaden only evidence-backed shipper qualification | High | 7/10 |
| 9 | Logistics manager | Logistics hub/commercial page | Structured intake, documents, carrier review, communication, and operational boundaries exist | Reporting, escalation ownership, integrations, recurring workflow, service-level expectations | Can reach correct contact; enterprise procurement evidence is limited | No named account owner, sample report, SLA, integration case, or customer reference | Create a sanitized recurring-operations scope/sample after owner approval; do not promise SLA before process exists | High | 7/10 |
| 10 | Freight broker | `/paths/logistics/brokers/carrier-capacity/` | Hermes can discuss carrier-capacity relationships and operating fit | Authority relationship, carrier data quality, capacity freshness, legal representation, fraud controls | Specialized route exists, but trust threshold is high | No independently verified carrier-network or broker-partner evidence | Approve legal relationship language; publish methodology, not unsupported network size | High | 6/10 |
| 11 | Driver or HR candidate | `/logistics/careers/` or `/logistics/apply/` | Candidate can review the work direction and submit for human review | Current vacancy, employment/contract model, compensation, schedule, employer entity, response | Application route exists; marketing/Academy/recruiting concepts can still be confused | External recruiting profiles contain inconsistent employee/network facts | Reconcile Work.ua/Staff.am first; create role-specific current facts and expire stale vacancies | High | 6/10 |
| 12 | Insurance / factoring / ELD partner | Logistics partner/agency/contact route | Hermes has carrier workflows where an approved vendor relationship might fit | Decision owner, partnership criteria, current carrier base, data/security rules, commercial model | No strong dedicated vendor qualification path | High risk of speculative partnership claims or private-data requests | Add a noindex partner-intake specification only after owner approves partner categories and data boundaries | Medium | 5/10 |
| 13 | Logistics SEO client | `/services/seo-for-logistics-companies/` | Logistics-specific search/conversion architecture is offered | Named expert, sample deliverable, external case, current results | Engagement starting point is clearer; intake is available | Evidence is primarily first-party/internal and not yet measured | Name reviewer; publish sanitized sample audit; connect to GSC/GA4 evidence when authenticated | High | 7/10 |
| 14 | Website-development client | `/services/website-development/` | Hermes IT can define a website/business-system scope with discovery and controlled handoff | Portfolio quality, named team, stack/ownership, timeline, price, security, maintenance | Project brief helps; no secure direction-specific delivery event is verified in analytics | Public proof and team identity are weak; specifications can be mistaken for live products | Publish one verified production project case and ownership/maintenance scope; verify event transport | High | 7/10 |
| 15 | Marketing client | `/paths/marketing/` | ProgressoPro can start with diagnostic, focused cycle, or ongoing system across website/SEO/social/growth | Real client results, named strategist, exact deliverables, fee, channel expertise | Engagement levels reduce ambiguity; email coordination remains the main route | External proof, permissioned results, and profile consistency remain weak | Approve one result case with source/date/method and named reviewer; align external profiles | High | 7/10 |
| 16 | Academy applicant | `/academy/us-logistics-operations/`, `/academy/marketing/`, or `/academy/apply/` | Two approved public programs use human application review and do not guarantee enrollment/work/income | Current schedule, language, price, seat, mentor, format, workload, outcome | Post-application process is now clearer | No named instructor, current cohort facts, approved price/schedule, or response baseline | Approve current program facts and instructor; track application dispositions separately from leads/recruiting | High | 7/10 |
| 17 | Investor / strategic partner | Homepage and `/about/` | Hermes presents four connected directions and substantial operating-system thinking | Legal entities, ownership, revenue, team, traction, market focus, authority, governance, financial proof | General contact exists but no investor-grade information path | Public scale/entity facts are inconsistent and quantitative proof is absent | Do not build investor claims from old resumes/profiles; create a private evidence-backed data room first | High | 5/10 |
| 18 | Journalist / researcher | `/about/`, editorial policy, resources | Hermes has documented service/education/technology directions and correction boundaries | Named spokesperson, legal identity, dates, sources, independent coverage, usable media facts | Editorial/correction routes help; entity facts remain incomplete | No press factsheet, spokesperson, or independently sourced company history | Approve canonical facts and named media contact; publish a source-backed factsheet only afterward | Medium | 5/10 |
| 19 | Google Search/Ads quality reviewer | Canonical money page, policy/trust pages, forms | Site is technically structured, original, explicit about demos/guarantees, and uses direct contact/intake paths | Business identity consistency, location truth, proof, actual service availability, landing-to-ad message match | Technical experience is strong; disclaimers sometimes outweigh proof | External profile contradictions and limited real proof can reduce confidence | Reconcile profiles/location language; add permissioned proof; verify production destination and policy compliance per campaign | High | 8/10 technical; 6/10 trust |
| 20 | ChatGPT/Gemini/Claude user seeking a mobile recommendation | Branded/non-branded search → homepage/service page | Machine-readable services and role routes exist, with clear claim boundaries | Independent citations, reviews, named experts, entity disambiguation, current facts | Mobile routing is materially better; AI systems may still rely on conflicting third-party profiles | Same-name Hermes businesses and legacy profile claims can contaminate answers | Complete #204; build exact `sameAs` set, named expertise, permissioned cases, and independent relevant mentions | High | 6/10 |

---

# Persona-level common friction themes

## 1. Proof gap

A visitor can increasingly understand the process and reach the correct action, but cannot yet verify enough real-world evidence.

Required evidence order:

1. canonical legal/public company facts;
2. named real reviewers/instructors with consent and current responsibility;
3. sanitized workflow screenshots or sample deliverables;
4. one permissioned carrier case;
5. one permissioned dealer/customer movement case;
6. one external SEO/marketing or IT case;
7. legitimate reviews and independent citations.

## 2. Response and ownership gap

The technical receiver is verified, but the public experience does not yet have measured evidence for:

- who reviews each direction;
- human-review coverage;
- median first-review time;
- qualification and contact rates;
- escalation ownership;
- not-ready or no-fit handling.

Do not publish response-time language until the private operating process and baseline support it.

## 3. Entity inconsistency

The owned site uses conservative boundaries, while third-party recruiting/company profiles expose conflicting employee, agency/network, location, benefit, future-direction, and service claims.

This creates risk for:

- branded search trust;
- AI answer accuracy;
- candidates;
- customers and partners;
- legal/business identity interpretation;
- paid-search quality review.

Issue #204 remains P0 for trust, even though it is not a code blocker.

## 4. Measurement gap

Repository events and tests are not a commercial baseline.

Issue #206 must establish:

- Search Console/Bing page/query/index evidence;
- GA4 custom-event transport and privacy verification;
- receiver-to-human-review reconciliation;
- direction-specific qualified inquiry counts;
- 7-day and 28-day scorecards;
- lab versus real-user performance separation.

## 5. Scope-specific gaps

- **Carriers:** agreement/fee clarity and real workflow proof.
- **Dealers/auction buyers:** completed movement and exception proof.
- **Shippers/managers/brokers:** legal role, recurring workflow, reporting/escalation, customer evidence.
- **SEO/Marketing/IT:** named expertise, sample deliverables, external outcomes.
- **Academy:** current cohort facts, instructor, pricing/schedule/format after approval.
- **Investors/media/partners:** authoritative facts and private evidence before public scale claims.

---

# Updated priority queue

## P0 — evidence and measurement

1. Complete owner approval of `docs/CANONICAL_COMPANY_FACTS_APPROVAL.md` privately.
2. Correct Work.ua and Staff.am current facts, then recheck branded search.
3. Authenticate Search Console, Bing, and GA4; execute Issue #206 verification protocol.
4. Create the private receiver-to-review-to-qualified reconciliation process using `docs/QUALIFIED_INQUIRY_DEFINITIONS.md`.
5. Approve one named Logistics reviewer and one Academy instructor/mentor.
6. Acquire permission and source evidence for one carrier and one dealer/customer case.

## P1 — trust conversion

1. Publish a sanitized Logistics SEO sample deliverable.
2. Publish a carrier operating-scope/workflow example without private or guaranteed outcomes.
3. Publish a dealer/auction movement checklist plus permissioned completed-case evidence.
4. Approve a fleet operating-plan template after the related page change is released and measured.
5. Create accurate current recruiting profiles and expire stale future-direction/vacancy language.
6. Add a public media/company factsheet only after canonical facts are approved.

## P2 — optimization after baseline

1. Review 7-day and 28-day funnel data by landing page and direction.
2. Compare direct intake, phone fallback, and email fallback usage.
3. Test the four priority mobile tasks on constrained networks.
4. Use Search Console query data to improve existing canonical money pages.
5. Add or consolidate pages only when demand, uniqueness, internal ownership, and conversion evidence justify them.

---

# Acceptance review against Issue #176

| Acceptance criterion | Current status after retest |
| --- | --- |
| One scored audit record for all 20 personas | `COMPLETE IN THIS DOCUMENT` |
| Carrier, dealer, shipper, Logistics SEO five-second tests | `COMPLETE IN THIS DOCUMENT` |
| Primary carrier CTA separated from Load Board demo | `COMPLETE` |
| Production inquiry delivery verified | `COMPLETE THROUGH ISSUE #167` |
| Final Logistics CTA and direct fallback | `COMPLETE` |
| Demo dates cannot become stale | `COMPLETE` |
| Pricing/scope explanation without invented universal prices | `PARTIALLY COMPLETE`; digital scope improved, current carrier agreement/fee proof remains gated |
| Trust modules use approved evidence | `CONTROLLED / INCOMPLETE`; evidence register and gates exist, real proof remains limited |
| Carrier and customer/dealer cases evidence-gated | `COMPLETE AS A GATE`; public cases still pending evidence |
| PageSpeed/CWV, Search Console, GA4 baselines | `PARTIAL`; Lighthouse lab workflow exists, authenticated field/search/analytics baselines pending #206 |
| AI visibility distinguishes mention/citation/recommendation/accuracy | `COMPLETE IN INTERNAL CONTRACT`; production observations pending |
| Full CI green | `REQUIRED PER RELEASE`; this audit does not replace CI |
| No private/sensitive data in repository evidence | `PRESERVED` |

## Closure recommendation

Do not close Issue #176 yet.

The conversion architecture and the full persona retest are substantially complete. Keep #176 open as the master roadmap until:

- #204 external-profile/entity reconciliation reaches owner-approved implementation;
- #206 produces authenticated search/analytics/qualified-inquiry baselines;
- one carrier and one customer/dealer proof asset are permissioned and publication-ready;
- one named Logistics reviewer and one Academy instructor are approved;
- all open release PRs pass full CI and are reconciled with current `main`.

After those conditions, move ongoing monthly optimization into a smaller measurement/experimentation issue rather than keeping the original Secret Shopper audit permanently open.
