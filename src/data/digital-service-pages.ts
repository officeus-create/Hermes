export interface DigitalServicePageContent {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  audience: string[];
  deliverables: Array<{ title: string; body: string }>;
  process: Array<{ title: string; body: string }>;
  boundaries: string[];
  faq: Array<{ question: string; answer: string }>;
  related: Array<{ label: string; href: string }>;
  reviewedAt: string;
}

export const digitalServicePages: Record<string, DigitalServicePageContent> = {
  websiteDevelopment: {
    slug: "/services/website-development/",
    title: "Website Development Services for U.S. Businesses | Hermes",
    description: "Custom website development for U.S. businesses, including logistics, trucking, dispatch and freight-broker companies: architecture, responsive engineering, SEO foundations, integrations, qualification and QA.",
    eyebrow: "Hermes IT Development · National Service",
    h1: "Custom Website Development for U.S. Businesses",
    intro: "Hermes plans and builds business websites around the company, its customers, and the action each visitor should take. The engagement starts with discovery and information architecture, then moves through responsive design, engineering, technical SEO, qualification, quality assurance, and a controlled release. Logistics, trucking, dispatch, freight-broker, vehicle-transport, dealer and other operational businesses can also separate customer, carrier, quote, apply, partner and resource journeys without exposing private records.",
    audience: [
      "New businesses that need a credible public foundation",
      "Established companies replacing fragmented or template-driven pages",
      "Service businesses that need a clearer path from search to inquiry",
      "Logistics, trucking, dispatch, freight-broker, carrier-support, vehicle-transport and dealer businesses with several audiences and operational workflows",
      "Teams planning multilingual, CRM, booking, payment, portal, load-board, API, analytics or automation phases",
    ],
    deliverables: [
      { title: "Business discovery", body: "Clarify the company, services, audiences, public claims, required pages, customer actions, content responsibilities, sales capacity, privacy boundaries and release constraints." },
      { title: "Information architecture", body: "Map navigation, service clusters, customer journeys, conversion paths, internal links, and the role of each page before development begins." },
      { title: "Logistics and operational website architecture", body: "For logistics companies, separate shipper, dealer, broker, carrier, owner-operator, driver, partner and customer intent; define quote, carrier, apply, resource and contact paths; and keep private shipment, rate, identity and account data outside public pages and analytics." },
      { title: "Responsive product design", body: "Create an original interface system for desktop and mobile with accessible structure, clear hierarchy, and reusable components." },
      { title: "Engineering and technical SEO", body: "Build clean, crawlable pages with metadata, canonical URLs, structured data where supported, sitemap coverage, performance controls, internal-link ownership, and maintainable code." },
      { title: "Contact and qualification workflow", body: "Design an honest inquiry path with direct contact fallback and service-specific qualification. Live delivery, CRM writes, booking, payments, account creation, load publication, and integrations are connected only when separately reviewed and approved." },
      { title: "Integrations and phased systems", body: "Plan approved CRM, Google Workspace, booking, payment, mapping, inventory, carrier, load-board, portal, API, analytics or automation connections as separate reviewed phases with permissions, security, fallback and ownership." },
      { title: "Quality and controlled release", body: "Check build output, links, forms, keyboard behavior, mobile layouts, accessibility, privacy boundaries, analytics events, structured data, redirects, generated pages and browser workflows before release review." },
    ],
    process: [
      { title: "Discovery", body: "Define the business goal, audience, services, evidence, content, languages, constraints, integrations, privacy boundaries, sales workflow, and desired customer action." },
      { title: "Architecture and brief", body: "Approve page structure, navigation, query ownership, content responsibilities, conversion and qualification paths, technical requirements, operational audiences, and phased scope." },
      { title: "Design and build", body: "Create the interface, components, pages, metadata, structured data, contact workflow, service context, and approved integrations." },
      { title: "QA and review", body: "Run automated and browser checks, repair defects, review claims, privacy, mobile behavior, contact fallback, indexability, and integration boundaries, and prepare the release record." },
      { title: "Launch and improvement", body: "Release only after approval, then use Search Console, analytics, inquiries, qualified-lead review, user feedback, errors and operational capacity to prioritize controlled improvements." },
    ],
    boundaries: [
      "Branding, copywriting, content migration, ecommerce, booking, payments, CRM, portals, load boards, AI, hosting, maps, inventory, carrier systems and third-party integrations are included only when the agreed scope says so.",
      "A website project does not guarantee rankings, traffic, loads, carriers, customers, leads, revenue, ROI, or a fixed completion date before discovery.",
      "No live submission, payment, booking, message, account, load publication, carrier assignment, CRM write, or external-system connection is activated without technical review and approval.",
      "The public site and analytics must not expose private company records, credentials, internal prompts, customer or carrier data, shipment details, rates, documents, exact private locations, submitted website URLs, budgets, or unsupported claims.",
    ],
    faq: [
      { question: "What is included in a custom website project?", answer: "A typical project can include discovery, information architecture, responsive design, development, contact and conversion planning, technical SEO foundations, analytics planning, QA, launch preparation, and handoff. The final scope is confirmed after discovery." },
      { question: "Can Hermes build a website for a logistics, trucking, dispatch, or freight-broker company?", answer: "Yes, when the service model and public facts are confirmed. The architecture can separate shipper, dealer, broker, carrier, owner-operator, driver, partner and customer journeys; organize services, equipment and resources; and connect quote, carrier, apply, contact and qualification paths without publishing private operational data." },
      { question: "What should a logistics company website include?", answer: "The exact scope depends on the company, but useful foundations often include clear services and audiences, service-area and equipment boundaries, customer and carrier paths, quote or project qualification, direct contact fallback, trust and policy pages, useful resources, technical SEO, privacy-safe measurement, and carefully reviewed integrations. A public website should not imply live capacity, loads, rates, lanes or affiliations without evidence." },
      { question: "Can Hermes redesign an existing website instead?", answer: "Yes. Existing websites can be reviewed for structure, usability, mobile quality, conversion paths, technical SEO, migration risk, content, analytics, integrations, private-data exposure, and audience separation before a redesign scope is proposed." },
      { question: "Can the website connect to a CRM, booking system, load board, carrier system, or payments?", answer: "Potentially, when the required platform, permissions, data flow, privacy, security, fallback, operating responsibilities, provider limits, costs and approval are reviewed. A connection is not assumed or activated automatically." },
      { question: "Does website development guarantee search rankings or leads?", answer: "No. Hermes can improve the website, technical foundation, content architecture, conversion and qualification paths, integration readiness, and measurement. Search engines, markets, customers and sales execution remain outside Hermes control." },
      { question: "How does the project begin?", answer: "Share the company, services, audience, current website if one exists, target U.S. market, customer languages, desired customer action, operational workflows, references, constraints, integrations, timeline preference, and the next business result the website should support." },
    ],
    related: [
      { label: "Website Redesign Services", href: "/services/website-redesign/" },
      { label: "SEO Services", href: "/services/seo/" },
      { label: "SEO for Logistics Companies", href: "/services/seo-for-logistics-companies/" },
      { label: "Car Hauling Dispatch", href: "/logistics/car-hauling-dispatch/" },
      { label: "Hermes Website Case Study", href: "/case/it-development/" },
      { label: "Hermes IT Development", href: "/paths/technology/" },
    ],
    reviewedAt: "August 2, 2026",
  },
  websiteRedesign: {
    slug: "/services/website-redesign/",
    title: "Website Redesign Services | Hermes",
    description: "Website redesign for U.S. businesses: conversion review, information architecture, responsive UX, content and redirect planning, technical SEO, analytics, QA, and controlled migration.",
    eyebrow: "Hermes IT Development · National Service",
    h1: "Website Redesign Built Around Business Priorities",
    intro: "A redesign should solve measurable business and customer problems, not only change colors. Hermes reviews the current website, conversion path, content, mobile experience, search foundation, analytics, and technical constraints before proposing a replacement or staged improvement plan.",
    audience: [
      "Businesses with an outdated, slow, confusing, or difficult-to-maintain website",
      "Companies receiving traffic but weak inquiry or qualification activity",
      "Teams consolidating several brands, services, domains, or customer journeys",
      "Businesses preparing multilingual content, CRM, booking, payments, or automation",
    ],
    deliverables: [
      { title: "Current-site review", body: "Assess navigation, page purpose, mobile behavior, accessibility, conversion paths, metadata, internal links, analytics, content, and technical risks." },
      { title: "Redesign priorities", body: "Separate must-fix business problems from visual preferences, optional features, future integrations, and content that should be retained, rewritten, consolidated, or removed." },
      { title: "Migration architecture", body: "Map old and new URLs, canonical targets, redirects, navigation, sitemap coverage, content ownership, measurement, and rollback considerations." },
      { title: "Responsive interface", body: "Build a clear visual system and reusable page components around real services, evidence, audiences, and customer actions." },
      { title: "Conversion and contact flow", body: "Improve calls to action, qualification, direct contact fallback, trust signals, and preview/live submission boundaries." },
      { title: "Release protection", body: "Validate generated pages, redirects, canonical URLs, metadata, forms, links, mobile behavior, analytics, schema, privacy, and browser workflows before replacement." },
    ],
    process: [
      { title: "Audit", body: "Review the existing site, analytics available for the project, current customer journey, business priorities, content, technical stack, and operational constraints." },
      { title: "Migration plan", body: "Approve what stays, changes, moves, redirects, or requires new evidence and content." },
      { title: "Design and implementation", body: "Build the approved structure and interface without weakening working contact, analytics, SEO, privacy, or accessibility contracts." },
      { title: "Regression review", body: "Compare old and new routes, metadata, links, forms, events, mobile layouts, and required content before launch approval." },
      { title: "Post-release monitoring", body: "Review Search Console, analytics, errors, inquiries, and user feedback, then prioritize controlled corrections and improvements." },
    ],
    boundaries: [
      "A redesign does not automatically include a new brand, rewritten copy, photography, ecommerce, CRM, booking, payments, or third-party integrations.",
      "Legacy traffic and rankings cannot be guaranteed; redirects, canonicals, content, and technical migration are reviewed to reduce avoidable risk.",
      "No production replacement, domain, DNS, hosting, or account change is performed as an unreviewed side effect.",
      "Unsupported claims and private data are not copied from the old website into the new public site.",
    ],
    faq: [
      { question: "How do you decide whether a full redesign is necessary?", answer: "The current site is reviewed against business goals, customer tasks, content, mobile experience, conversion paths, maintainability, technical SEO, accessibility, and integration needs. Some businesses need staged fixes rather than a complete replacement." },
      { question: "Can existing pages and search visibility be preserved?", answer: "Useful content and URLs can be retained or migrated with reviewed redirects, canonicals, internal links, sitemap updates, and post-release monitoring. Search performance remains controlled by search engines and cannot be guaranteed." },
      { question: "Will the redesign improve conversions?", answer: "Hermes can improve clarity, calls to action, qualification, contact fallback, speed, mobile usability, trust, and measurement. Actual inquiry and revenue results depend on traffic, offer, market, sales process, and other factors." },
      { question: "Can redesign work be completed in phases?", answer: "Yes. A project may begin with high-priority pages, navigation, conversion paths, or technical issues, then expand after the first controlled release." },
      { question: "What should we provide for the review?", answer: "Provide the current website, business goals, priority services, target customers, important pages, known problems, analytics or Search Console access status, desired integrations, content ownership, references, and timeline preference." },
    ],
    related: [
      { label: "Website Development Services", href: "/services/website-development/" },
      { label: "SEO Services", href: "/services/seo/" },
      { label: "Local SEO Services", href: "/services/local-seo/" },
      { label: "Hermes Website Case Study", href: "/case/it-development/" },
      { label: "Start a Project Brief", href: "/paths/technology/#project-brief" },
    ],
    reviewedAt: "July 31, 2026",
  },
  seo: {
    slug: "/services/seo/",
    title: "SEO Services for U.S. Businesses | Hermes",
    description: "SEO services for U.S. businesses: technical audits, indexability, search-intent mapping, commercial content architecture, internal links, schema, Search Console, GA4, and refresh planning.",
    eyebrow: "Hermes IT Development · Search Growth",
    h1: "SEO Services Built on Technical Quality and Useful Content",
    intro: "Hermes combines technical SEO, search-intent research, commercial content architecture, internal linking, structured data, measurement, and controlled improvement. The work is tied to real services and customer needs rather than mass-produced pages or ranking promises.",
    audience: [
      "Businesses whose important pages are difficult to discover, crawl, index, or understand",
      "Companies with weak service architecture, thin content, or unclear customer journeys",
      "Teams publishing pages without Search Console, analytics, or conversion measurement",
      "Businesses planning national, niche, multilingual, or location-based growth",
    ],
    deliverables: [
      { title: "Technical SEO review", body: "Review crawlability, indexability, canonical URLs, redirects, sitemaps, robots rules, metadata, structured data, performance, mobile quality, and generated output." },
      { title: "Search-intent architecture", body: "Map query families to one preferred page, distinguish national, niche, local, educational, and commercial intent, and identify missing or competing pages." },
      { title: "Commercial content system", body: "Prepare service pages, briefs, FAQs, evidence boundaries, internal links, CTAs, and content refresh priorities around real business value." },
      { title: "Internal linking and entities", body: "Connect hubs, services, resources, cases, languages, and conversion routes with descriptive links and consistent Organization, Service, Article, FAQ, and Breadcrumb data when visible content supports them." },
      { title: "Measurement", body: "Use Search Console and privacy-safe analytics events to review discovery, indexing, impressions, clicks, CTR, average position, query fit, CTA activity, and cannibalization." },
      { title: "Controlled improvement", body: "Prioritize technical repairs, title and snippet improvements, internal links, content expansion, consolidation recommendations, and future pilots based on dated evidence." },
    ],
    process: [
      { title: "Business and evidence review", body: "Confirm services, audiences, proof, current website, target markets, public claim boundaries, contact path, and measurement access." },
      { title: "Technical and content audit", body: "Identify blocking defects, indexable inventory, search-intent gaps, internal-link depth, duplicate targeting, performance issues, and measurement gaps." },
      { title: "Priority map", body: "Separate immediate repairs, commercial-page opportunities, supporting resources, experiments, and evidence-gated future markets." },
      { title: "Implementation and QA", body: "Apply approved changes in small batches with build, static, unit, registry, and browser checks." },
      { title: "Search Console review", body: "Measure indexing and query/page behavior, then continue only the clusters that show useful search and business signals." },
    ],
    boundaries: [
      "Search engines control crawling, indexing, rankings, rich results, and traffic. Hermes does not guarantee positions, clicks, leads, revenue, timeline, or ROI.",
      "No city, niche, language, or route page is published only because a keyword tool reports low difficulty.",
      "Schema must match visible content and does not guarantee a rich result.",
      "Customer rankings, traffic, leads, revenue, or percentages are not presented without source, date, baseline, work performed, permission, and review.",
    ],
    faq: [
      { question: "What does an SEO engagement include?", answer: "Depending on scope, it may include technical review, indexability, metadata, canonicals, sitemap and robots QA, search-intent mapping, content architecture, internal links, schema, performance, Search Console, analytics, conversion paths, refresh planning, and implementation." },
      { question: "Can Hermes guarantee first-page rankings?", answer: "No. Search engines control rankings and can change results at any time. Hermes provides research, implementation, measurement, and ongoing optimization without guaranteeing positions or traffic." },
      { question: "Do you create new SEO pages?", answer: "Yes, when the business offers the service, useful evidence and unique value exist, the page fits the site architecture, and the query intent and conversion path justify a page. Thin or duplicated pages are not the goal." },
      { question: "How is SEO performance measured?", answer: "Measurement can include index status, impressions, clicks, CTR, average position, query-to-page fit, competing pages, privacy-safe CTA activity, contact activity, and approved aggregate qualified inquiries." },
      { question: "When should Local SEO be handled separately?", answer: "Local SEO needs separate service-area, market, business-profile, local-intent, location-evidence, review, and conversion considerations. Use the Local SEO service page for that scope." },
    ],
    related: [
      { label: "Local SEO Services", href: "/services/local-seo/" },
      { label: "Website Development Services", href: "/services/website-development/" },
      { label: "Website Redesign Services", href: "/services/website-redesign/" },
      { label: "Hermes Website Case Study", href: "/case/it-development/" },
      { label: "Hermes IT Development", href: "/paths/technology/" },
    ],
    reviewedAt: "July 31, 2026",
  },
  localSeo: {
    slug: "/services/local-seo/",
    title: "Local SEO Services for U.S. Businesses | Hermes",
    description: "Local SEO for eligible U.S. businesses: real service-area research, local intent, Google Business Profile support, location content, schema, internal links, measurement, and review planning.",
    eyebrow: "Hermes IT Development · Local Search",
    h1: "Local SEO for Real U.S. Service Areas and Customer Needs",
    intro: "Hermes helps eligible businesses organize local search around real locations, service areas, services, customer questions, proof, and conversion paths. Local growth begins with one evidence-backed market and expands only after indexing, engagement, and business relevance are reviewed.",
    audience: [
      "Local service businesses with a real office, storefront, or verified service area",
      "Multi-location businesses that need distinct, accurate location architecture",
      "Professional, beauty, wellness, education, home-service, dealer, and logistics businesses",
      "Companies with incomplete local pages, weak Google Business Profile workflows, or untracked calls and inquiries",
    ],
    deliverables: [
      { title: "Eligibility and service-area review", body: "Confirm the real business location or service area, business category, services, customer geography, profile eligibility, public evidence, and operating boundaries." },
      { title: "Local market research", body: "Review relevant businesses, search result quality, query intent, competition, demand signals, unique local value, and the customer action the page should support." },
      { title: "Location and service architecture", body: "Choose the correct relationship between national services, location hubs, service-area pages, niche pages, resources, cases, and contact paths." },
      { title: "Google Business Profile support", body: "Support profile information, categories, services, pages, posts, review workflows, and measurement only when access and business eligibility are confirmed." },
      { title: "Local content and schema", body: "Create useful location-specific guidance, visible business facts, FAQs, internal links, and supported LocalBusiness, Service, FAQ, and Breadcrumb data without fake offices or copied city text." },
      { title: "Local measurement and refresh", body: "Review Search Console, profile insights when approved, calls, contact activity, query/page fit, cannibalization, content accuracy, and evidence dates." },
    ],
    process: [
      { title: "Confirm the real market", body: "Document location or service area, services, eligibility, evidence, customer need, response capacity, and contact path." },
      { title: "Score the opportunity", body: "Review business density, competition gap, demand and service fit, unique local value, conversion path, evidence, and review date." },
      { title: "Build one pilot", body: "Create one useful market or service-area page only after the national service architecture and 7/10 evidence gate are satisfied." },
      { title: "Validate and release", body: "Check canonical, metadata, H1, visible breadcrumbs, schema, sitemap, internal links, privacy, claims, mobile behavior, and CTA workflow." },
      { title: "Measure before expansion", body: "Review indexing, queries, impressions, clicks, CTA activity, qualified inquiries when approved, and cannibalization before adding more locations." },
    ],
    boundaries: [
      "Hermes does not create fake offices, unsupported service areas, or doorway pages.",
      "A low keyword-difficulty score is not enough reason to publish a city page.",
      "Google controls profile eligibility, verification, suspensions, map results, rankings, and visibility.",
      "Local rankings, calls, appointments, leads, revenue, timeline, and ROI are not guaranteed.",
    ],
    faq: [
      { question: "What is required before Local SEO begins?", answer: "Hermes needs the real business location or service area, business category, services, customers, public business facts, profile status, target markets, current website, conversion path, and the ability to respond to inquiries." },
      { question: "Do you create pages for every nearby city?", answer: "No. A location page requires real service relevance, dated demand and competition evidence, unique local value, internal links, a useful CTA, and a score that justifies editorial review." },
      { question: "Can Hermes guarantee Google Maps rankings?", answer: "No. Google controls profile eligibility, verification, map results, ranking systems, and visibility. Hermes can improve approved information, pages, local architecture, content, links, schema, and measurement." },
      { question: "Can you help with Google Business Profile?", answer: "Yes, when the business is eligible and authorized access is available. Scope may include information review, categories, services, pages, posts, review workflows, and measurement planning." },
      { question: "How are new local markets selected?", answer: "Markets are scored by relevant business density, competition gap, demand and service fit, unique niche or local value, internal-link and conversion path, dated evidence, response capacity, and claim/privacy review." },
    ],
    related: [
      { label: "SEO Services", href: "/services/seo/" },
      { label: "Website Development Services", href: "/services/website-development/" },
      { label: "Website Redesign Services", href: "/services/website-redesign/" },
      { label: "Hermes Website Case Study", href: "/case/it-development/" },
      { label: "Discuss a Project", href: "/paths/technology/#project-brief" },
    ],
    reviewedAt: "July 31, 2026",
  },
};
