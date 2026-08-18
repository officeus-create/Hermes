import type { GeoAnswerSurface } from "./geo-answer-contract";

export const geoAnswerSurfaceDemo: GeoAnswerSurface = {
  id: "geo-car-hauling-dispatch-fit-demo",
  slug: "/demos/geo-answer-surface/",
  question: "What should a car-hauling owner-operator compare before choosing dispatch support?",
  audience: "U.S. car-hauling owner-operators evaluating dispatch support",
  intent: "comparison and decision support",
  layers: {
    shortAnswer:
      "Compare control, operating fit, broker-readiness support, and the handoff you actually need—not just a percentage.",
    why: [
      "Two services can look similar on price while giving the carrier very different levels of control and operational support.",
      "The useful question is not only who can search for loads, but which workflow matches the way you want to operate.",
    ],
    evidenceClaimIds: ["claim-demo-control", "claim-demo-readiness", "claim-demo-next-step"],
    whatItMeansForYou: [
      "If control matters most, compare who makes the final booking decision and how options are presented to you.",
      "If setup friction is the blocker, compare the broker-readiness workflow before comparing load-search speed.",
      "If you already have a working process, look for support that fills the missing step instead of replacing everything.",
    ],
    howToApply: [
      "Name the one operational problem you want to improve first.",
      "Compare the service on that problem using the same criteria for every option.",
      "Choose a next step that gives you more information without forcing a large commitment.",
    ],
    nextAction: {
      label: "Compare dispatch models",
      href: "/logistics/resources/dispatch-service-vs-self-dispatch/",
      actionType: "compare",
      rationale: "Use the existing comparison resource before deciding whether outside dispatch support fits your workflow.",
    },
  },
  claims: [
    {
      id: "claim-demo-control",
      text: "Demo: a useful dispatch comparison should make carrier control visible instead of hiding it behind a generic service label.",
      truthLabel: "demo",
      evidenceIds: ["evidence-demo-contract"],
    },
    {
      id: "claim-demo-readiness",
      text: "Demo: broker-readiness can be treated as a separate decision dimension from load-search execution.",
      truthLabel: "demo",
      evidenceIds: ["evidence-demo-contract"],
    },
    {
      id: "claim-demo-next-step",
      text: "Demo: the GEO surface should end with a practical next step tied to the visitor's situation.",
      truthLabel: "demo",
      evidenceIds: ["evidence-demo-contract"],
    },
  ],
  evidence: [
    {
      id: "evidence-demo-contract",
      title: "GEO answer-surface preview contract",
      sourceName: "Hermes repository preview",
      origin: "demo",
      truthLabel: "demo",
      summary:
        "This evidence card exists only to demonstrate provenance, labeling, entity relationships, and guided action behavior. It is not customer, ranking, performance, partner, or external-source evidence.",
      verifiedAt: "2026-08-18T10:30:00Z",
    },
  ],
  entities: [
    {
      id: "owner-operator",
      name: "Car-hauling owner-operator",
      type: "audience",
      description: "Demo audience entity representing a carrier evaluating how much dispatch support fits its operating model.",
      relationToHermes: "Demo audience relationship for the preview surface.",
      whyItMatters: "The answer changes depending on how much control and operational help the carrier wants.",
      truthLabel: "demo",
      evidenceIds: ["evidence-demo-contract"],
    },
    {
      id: "dispatch-support",
      name: "Dispatch support",
      type: "service",
      description: "Demo service entity used to compare workflow fit, control, and execution support.",
      relationToHermes: "Demo service relationship for the preview surface; no new production offer is asserted here.",
      whyItMatters: "It is the decision category the visitor is evaluating.",
      truthLabel: "demo",
      evidenceIds: ["evidence-demo-contract"],
    },
    {
      id: "broker-readiness",
      name: "Broker setup readiness",
      type: "process",
      description: "Demo process entity representing preparation and setup work that may block execution.",
      relationToHermes: "Demo process relationship for explaining decision criteria.",
      whyItMatters: "A setup problem and a load-search problem require different next steps.",
      truthLabel: "demo",
      evidenceIds: ["evidence-demo-contract"],
    },
    {
      id: "hermes",
      name: "Hermes",
      type: "organization",
      description: "Hermes entity shown only to demonstrate how a GEO surface can explain entity relationships without exposing raw structured data to the visitor.",
      relationToHermes: "Self entity for the demo relationship map.",
      whyItMatters: "It makes the relationship between the answer, the service category, and Hermes explicit for both people and machines.",
      truthLabel: "demo",
      evidenceIds: ["evidence-demo-contract"],
    },
  ],
  relationships: [
    {
      id: "owner-evaluates-dispatch",
      fromEntityId: "owner-operator",
      toEntityId: "dispatch-support",
      relationship: "evaluates",
      truthLabel: "demo",
      evidenceIds: ["evidence-demo-contract"],
    },
    {
      id: "dispatch-considers-readiness",
      fromEntityId: "dispatch-support",
      toEntityId: "broker-readiness",
      relationship: "decision can depend on",
      truthLabel: "demo",
      evidenceIds: ["evidence-demo-contract"],
    },
    {
      id: "hermes-explains-dispatch",
      fromEntityId: "hermes",
      toEntityId: "dispatch-support",
      relationship: "explains in this demo",
      truthLabel: "demo",
      evidenceIds: ["evidence-demo-contract"],
    },
  ],
  guidedPath: {
    startQuestionId: "goal",
    questions: [
      {
        id: "goal",
        prompt: "What are you trying to improve today?",
        helpText: "Choose the closest problem. You can refine it in the next step.",
        options: [
          {
            id: "goal-loads",
            label: "Load-search execution",
            realization: "Your bottleneck sounds closer to execution than setup readiness.",
            nextQuestionId: "priority",
          },
          {
            id: "goal-setup",
            label: "Broker setup readiness",
            realization: "Your next useful step is to reduce setup friction before optimizing load search.",
            outcomeId: "setup-route",
          },
          {
            id: "goal-control",
            label: "Support without losing control",
            realization: "Control is the decision criterion we should make explicit next.",
            nextQuestionId: "priority",
          },
        ],
      },
      {
        id: "priority",
        prompt: "What matters most in the next decision?",
        helpText: "Pick one priority so the recommendation stays simple.",
        options: [
          {
            id: "priority-control",
            label: "Control",
            realization: "A control-first comparison should make final decision rights explicit.",
            outcomeId: "control-route",
          },
          {
            id: "priority-speed",
            label: "Speed",
            realization: "An execution-first comparison should focus on the steps between opportunity and approved booking.",
            outcomeId: "execution-route",
          },
          {
            id: "priority-simplicity",
            label: "Simplicity",
            realization: "A simpler workflow starts by removing the operational step creating the most friction.",
            outcomeId: "setup-route",
          },
        ],
      },
    ],
    outcomes: [
      {
        id: "control-route",
        title: "Control-first route",
        diagnosis: "You want support, but the workflow should keep the carrier's decision rights visible.",
        application: [
          "Compare how options are presented.",
          "Confirm who approves the final booking decision.",
          "Prefer a small review step before a larger commitment.",
        ],
        nextAction: {
          label: "Review self-dispatch vs support",
          href: "/logistics/resources/dispatch-service-vs-self-dispatch/",
          actionType: "compare",
          rationale: "The comparison is more useful than a generic contact CTA for a control-first visitor.",
        },
      },
      {
        id: "setup-route",
        title: "Readiness-first route",
        diagnosis: "The immediate blocker is setup readiness rather than the search for opportunities itself.",
        application: [
          "Separate setup requirements from execution requirements.",
          "Prepare a clean, secure setup packet.",
          "Return to dispatch-fit comparison after the readiness blocker is clearer.",
        ],
        nextAction: {
          label: "Open broker setup checklist",
          href: "/logistics/resources/broker-setup-packet-checklist/",
          actionType: "prepare",
          rationale: "Resolve the readiness bottleneck before asking for a broader service decision.",
        },
      },
      {
        id: "execution-route",
        title: "Execution-first route",
        diagnosis: "You are primarily evaluating how a dispatch workflow can reduce execution friction.",
        application: [
          "Define the execution step you want help with.",
          "Compare how opportunities move to review and approval.",
          "Keep the final operating decision explicit.",
        ],
        nextAction: {
          label: "Review car-hauling dispatch support",
          href: "/logistics/car-hauling-dispatch/",
          actionType: "learn",
          rationale: "Continue into the most relevant Hermes owner page instead of returning to the generic homepage.",
        },
      },
    ],
  },
};