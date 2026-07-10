export type ClaimStatus =
  | "VERIFIED_PUBLIC"
  | "VERIFIED_INTERNAL"
  | "OWNER_APPROVED_PENDING_SOURCE"
  | "PLACEHOLDER_DO_NOT_PUBLISH";

export const site = {
  brand: "Hermes",
  domain: "hermeslogisticus.com",
  navigation: [
    { label: "Paths", href: "#paths" },
    { label: "How it works", href: "#journey" },
    { label: "About", href: "#about" },
  ],
  hero: {
    eyebrow: "Business · Education · Logistics",
    title: "Hermes. One ecosystem. Three ways forward.",
    body: "Choose the path that fits your next move: grow a business, build practical skills, or move freight with an operations-first team.",
    primaryCta: { label: "Explore your path", href: "#paths" },
    secondaryCta: { label: "Talk to our team", href: "#contact" },
    image: "/images/hermes-hero.jpg",
    imageAlt: "Modern logistics fulfillment center",
  },
  paths: [
    {
      id: "logistics",
      number: "01",
      category: "Hermes Logistics",
      title: "Move freight with a team built around clear operations.",
      body: "A practical route for carriers, shippers, and logistics partners looking for coordinated support in the U.S. market.",
      points: ["Carrier-focused support", "Clear communication", "Operational follow-through"],
      cta: "Explore logistics",
      image: "/images/path-logistics.jpg",
      imageAlt: "Professional freight truck on an open highway",
      tone: "violet",
    },
    {
      id: "marketing",
      number: "02",
      category: "ProgressoPro",
      title: "Turn attention into a repeatable growth system.",
      body: "A marketing path for teams that want clearer positioning, useful content, and a disciplined way to learn from results.",
      points: ["Organic growth systems", "Campaign structure", "Practical automation"],
      cta: "Explore marketing",
      image: "/images/path-marketing.jpg",
      imageAlt: "Marketing team reviewing analytics on a laptop",
      tone: "magenta",
    },
    {
      id: "academy",
      number: "03",
      category: "Hermes Business Academy",
      title: "Learn skills that connect to real business work.",
      body: "A structured education path focused on practical operations, sales, leadership, and modern digital workflows.",
      points: ["Applied learning", "Business-ready workflows", "Multiple career directions"],
      cta: "Explore the Academy",
      image: "/images/path-academy.jpg",
      imageAlt: "Professional learner working on a laptop in a bright study space",
      tone: "gold",
    },
  ],
  journey: [
    { number: "01", title: "Choose", body: "Start with the outcome you want, not a generic funnel." },
    { number: "02", title: "Connect", body: "Meet the right team, program, or business direction." },
    { number: "03", title: "Build", body: "Turn the next step into a clear, workable plan." },
    { number: "04", title: "Grow", body: "Review results and keep improving what works." },
  ],
  principles: [
    { title: "People first", body: "Clear communication and practical support shape every path." },
    { title: "Built for action", body: "We favor useful systems over complicated promises." },
    { title: "One connected view", body: "Education, marketing, and logistics reinforce each other without losing focus." },
  ],
  contact: {
    eyebrow: "Not sure where to begin?",
    title: "Tell us what you are building.",
    body: "Share your goal and we will help identify the most relevant Hermes path. This prototype form does not send or store data.",
  },
  claimRegister: [
    { claim: "Hermes operates as a multi-division business ecosystem", status: "VERIFIED_INTERNAL" as ClaimStatus },
    { claim: "Specific performance metrics and partner counts", status: "PLACEHOLDER_DO_NOT_PUBLISH" as ClaimStatus },
  ],
};
