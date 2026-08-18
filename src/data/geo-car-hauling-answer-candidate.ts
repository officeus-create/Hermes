import type { GeoAnswerSurface, GeoEvidenceReference } from "./geo-answer-contract.ts";
import { adaptPublicEntityForGeo } from "./geo-public-entity-adapter.ts";

const publicOwnerEvidence: GeoEvidenceReference = {
  id: "car-hauling-public-owner",
  title: "Car Hauling Dispatch Services for Owner-Operators and Small Fleets",
  sourceName: "Hermes public website · first-party service source",
  origin: "public_source",
  truthLabel: "verified_fact",
  summary:
    "First-party public source for the published service scope, intended carrier audience, carrier-controlled booking boundary, direct intake path, and no-guarantee statements. It is not independent third-party proof of performance.",
  url: "https://hermeslogisticsus.com/logistics/car-hauling-dispatch/",
  verifiedAt: "2026-08-18T10:40:00Z",
};

const hermesEntityResult = adaptPublicEntityForGeo("hermes_ecosystem", {
  description: "Hermes is the approved root public organization entity for the Hermes website ecosystem.",
  relationToHermes: "Canonical root organization entity.",
  whyItMatters: "The car-hauling service schema and answer surface need one governed provider identity instead of a competing Logistics organization node.",
  evidenceIds: [publicOwnerEvidence.id],
});

if (hermesEntityResult.status !== "approved" || !hermesEntityResult.entity) {
  throw new Error("The approved Hermes root entity is required for the car-hauling GEO candidate");
}

export const geoCarHaulingAnswerCandidate: GeoAnswerSurface = {
  id: "geo-car-hauling-dispatch-owner-candidate",
  slug: "/logistics/car-hauling-dispatch/",
  question: "What does Hermes car-hauling dispatch support include for owner-operators?",
  audience: "U.S. car-hauling owner-operators and small fleets evaluating dispatch support",
  intent: "commercial service understanding, fit evaluation, and next-step selection",
  layers: {
    shortAnswer:
      "Hermes can support current-load search, broker communication, setup and transport paperwork, invoicing and operating follow-through, plus approved longer-term customer and route research. The carrier reviews and approves every load before booking.",
    why: [
      "A dispatch percentage by itself does not explain who handles load search, broker calls, documents, invoicing, customer development, or daily follow-through.",
      "The useful comparison is scope plus control: what work is delegated, what stays with the carrier, and where the carrier must approve the operating decision.",
      "New-authority readiness, equipment, operating area, broker requirements, availability, and current workflow can change which support scope is practical.",
    ],
    evidenceClaimIds: ["car-hauling-scope", "carrier-control", "no-market-guarantee"],
    whatItMeansForYou: [
      "If your main bottleneck is daily execution, compare the exact tasks you want removed from the owner-operator's desk.",
      "If control matters most, confirm how candidate loads are presented and where your approval is required before booking.",
      "If broker setup or authority readiness is blocking execution, solve that readiness problem before treating load search as the only issue.",
      "If you already self-dispatch effectively, compare a narrower support scope or hybrid workflow instead of assuming full delegation is necessary.",
    ],
    howToApply: [
      "Choose the one operating problem you want to improve first: search coverage, back-office work, readiness, or longer-term demand development.",
      "Compare the proposed scope against your existing process and identify which decisions must remain carrier-controlled.",
      "Use the direct review intake only when you are ready to share the minimum private operating information needed for a human fit review.",
    ],
    nextAction: {
      label: "Start car-hauling dispatch review",
      href: "/logistics/start-car-hauling-dispatch/",
      actionType: "apply",
      rationale:
        "Continue from the service answer into the carrier-specific review workspace rather than sending a ready visitor back to a generic homepage or generic contact form.",
    },
  },
  claims: [
    {
      id: "car-hauling-scope",
      text: "Hermes publicly describes a car-hauling dispatch scope that can include current-load search, broker calls, setup packets, transport documents, invoicing, coordination, and approved longer-term customer or route research.",
      truthLabel: "verified_fact",
      evidenceIds: [publicOwnerEvidence.id],
    },
    {
      id: "carrier-control",
      text: "The published Hermes workflow states that the carrier reviews and approves every load before booking and retains the final operating decision.",
      truthLabel: "verified_fact",
      evidenceIds: [publicOwnerEvidence.id],
    },
    {
      id: "no-market-guarantee",
      text: "Hermes does not guarantee loads, rates, mileage, lane consistency, customers, search visibility, capacity, or revenue from the published dispatch process.",
      truthLabel: "verified_fact",
      evidenceIds: [publicOwnerEvidence.id],
    },
  ],
  evidence: [publicOwnerEvidence],
  entities: [
    hermesEntityResult.entity,
    {
      id: "car-hauling-dispatch-service",
      name: "Hermes car-hauling dispatch support",
      type: "service",
      description:
        "Published dispatch and back-office support for car-hauling owner-operators and small fleets, with carrier-controlled booking and a separate direct review intake.",
      relationToHermes: "Public logistics service provided by the governed Hermes root organization entity.",
      whyItMatters: "This is the service the visitor is trying to understand and compare before sharing private operating information.",
      truthLabel: "verified_fact",
      evidenceIds: [publicOwnerEvidence.id],
      schemaId: "https://hermeslogisticsus.com/logistics/car-hauling-dispatch/#service",
      url: "https://hermeslogisticsus.com/logistics/car-hauling-dispatch/",
    },
    {
      id: "car-hauling-owner-operator",
      name: "Car-hauling owner-operator",
      type: "audience",
      description:
        "Carrier audience operating vehicle-transport equipment and evaluating whether external dispatch or back-office support fits its workflow.",
      relationToHermes: "One of the published audiences for the car-hauling dispatch service.",
      whyItMatters: "The useful answer changes with authority readiness, equipment, workload, desired control, and the operating problem the carrier wants to solve.",
      truthLabel: "verified_fact",
      evidenceIds: [publicOwnerEvidence.id],
    },
  ],
  relationships: [
    {
      id: "hermes-provides-car-hauling-support",
      fromEntityId: "hermes_ecosystem",
      toEntityId: "car-hauling-dispatch-service",
      relationship: "provides",
      truthLabel: "verified_fact",
      evidenceIds: [publicOwnerEvidence.id],
    },
    {
      id: "car-hauling-support-serves-owner-operators",
      fromEntityId: "car-hauling-dispatch-service",
      toEntityId: "car-hauling-owner-operator",
      relationship: "serves",
      truthLabel: "verified_fact",
      evidenceIds: [publicOwnerEvidence.id],
    },
  ],
  guidedPath: {
    startQuestionId: "primary-bottleneck",
    questions: [
      {
        id: "primary-bottleneck",
        prompt: "What are you trying to improve first?",
        helpText: "Pick the closest operating problem. The next step becomes more specific from there.",
        options: [
          {
            id: "daily-execution",
            label: "Daily load-search execution",
            realization: "Your first comparison should focus on search coverage, broker communication, route fit, and the approval workflow.",
            nextQuestionId: "control-priority",
          },
          {
            id: "back-office",
            label: "Paperwork and back office",
            realization: "Your bottleneck is administrative load, so compare exactly which setup, document, invoicing, and follow-up tasks can be delegated.",
            outcomeId: "scope-review",
          },
          {
            id: "readiness",
            label: "Authority or broker readiness",
            realization: "Readiness is upstream of load search. Fixing setup friction first can make the later dispatch decision more useful.",
            outcomeId: "readiness-review",
          },
          {
            id: "decide-model",
            label: "Decide between self-dispatch and support",
            realization: "You are still choosing the operating model, so a comparison is more useful than an intake form right now.",
            outcomeId: "comparison-review",
          },
        ],
      },
      {
        id: "control-priority",
        prompt: "What matters most in the daily workflow?",
        helpText: "Choose one priority so the next action stays simple.",
        options: [
          {
            id: "keep-control",
            label: "Keep final load control",
            realization: "The published Hermes workflow keeps the carrier's final booking decision explicit.",
            outcomeId: "control-review",
          },
          {
            id: "reduce-admin",
            label: "Reduce daily admin",
            realization: "Your fit review should focus on the operational tasks surrounding the load, not only the search itself.",
            outcomeId: "scope-review",
          },
          {
            id: "broader-demand",
            label: "Build broader demand sources",
            realization: "Your interest extends beyond today's load search into approved customer and route research.",
            outcomeId: "demand-review",
          },
        ],
      },
    ],
    outcomes: [
      {
        id: "control-review",
        title: "Control-first dispatch review",
        diagnosis: "You want more execution support without handing over the carrier's final operating decision.",
        application: [
          "Confirm how candidate loads are presented.",
          "Define approved negotiation instructions.",
          "Keep final carrier approval explicit before booking.",
        ],
        nextAction: {
          label: "Start carrier-specific review",
          href: "/logistics/start-car-hauling-dispatch/",
          actionType: "apply",
          rationale: "The direct review workspace can evaluate the actual operating profile while preserving the published carrier-control boundary.",
        },
      },
      {
        id: "scope-review",
        title: "Scope-first support review",
        diagnosis: "Your decision depends on which daily tasks you want to delegate and which ones you already handle well.",
        application: [
          "List the repetitive operational tasks currently consuming owner time.",
          "Separate load-search work from setup, documents, invoicing, and follow-up.",
          "Compare the fee only after the scope is clear.",
        ],
        nextAction: {
          label: "Compare dispatch models",
          href: "/logistics/resources/dispatch-service-vs-self-dispatch/",
          actionType: "compare",
          rationale: "A scope comparison is the lower-friction next step before sharing private operating details.",
        },
      },
      {
        id: "readiness-review",
        title: "Readiness-first route",
        diagnosis: "Authority or broker setup readiness is the more immediate constraint than search coverage.",
        application: [
          "Confirm authority and insurance readiness.",
          "Prepare a secure broker setup packet.",
          "Return to dispatch-fit review after the upstream readiness gap is clearer.",
        ],
        nextAction: {
          label: "Open broker setup checklist",
          href: "/logistics/resources/broker-setup-packet-checklist/",
          actionType: "prepare",
          rationale: "Resolve the upstream readiness problem before treating dispatch as the only bottleneck.",
        },
      },
      {
        id: "comparison-review",
        title: "Comparison-first route",
        diagnosis: "You are deciding whether external dispatch support is needed at all.",
        application: [
          "Compare time, tools, broker relationships, paperwork discipline, and lane knowledge.",
          "Compare control and communication rules, not only price.",
          "Choose full support, narrower support, hybrid, or self-dispatch only after the workflow is clear.",
        ],
        nextAction: {
          label: "Compare self-dispatch vs support",
          href: "/logistics/resources/dispatch-service-vs-self-dispatch/",
          actionType: "compare",
          rationale: "The existing comparison resource matches this stage better than a generic sales CTA.",
        },
      },
      {
        id: "demand-review",
        title: "Demand-development route",
        diagnosis: "You are evaluating support that goes beyond today's load-board execution.",
        application: [
          "Separate current-load execution from longer-term customer research.",
          "Use only reviewed, public-safe operating patterns for route/service research.",
          "Treat route pages, rankings, customers, loads, rates, and revenue as unguaranteed outcomes.",
        ],
        nextAction: {
          label: "Review direct transport network",
          href: "/logistics/direct-vehicle-transport-network/",
          actionType: "learn",
          rationale: "Continue into the existing direct-demand explanation rather than implying a guaranteed private load source.",
        },
      },
    ],
  },
};