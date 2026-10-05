export type OpportunityPage = {
  slug: string;
  eyebrow: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  summary: string;
  audienceTitle: string;
  audience: string[];
  valueTitle: string;
  value: string[];
  process: { title: string; body: string }[];
  boundaries: string[];
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  contact: { label: string; href: string; value: string; note: string };
  directionLinks: { label: string; href: string; body: string }[];
  faq: { question: string; answer: string }[];
  related: string[];
};

const directions = {
  logistics: {
    label: "Hermes Logistics",
    href: "/paths/logistics/",
    body: "U.S. logistics, carrier support, dispatch, vehicle transport, and operating workflows.",
  },
  marketing: {
    label: "Hermes Marketing",
    href: "/paths/marketing/",
    body: "Websites, SEO, social media, lead generation, and measurable growth systems.",
  },
  technology: {
    label: "Hermes Technology",
    href: "/paths/technology/",
    body: "Web applications, CRM, workflow automation, AI-assisted systems, and digital products.",
  },
  academy: {
    label: "Hermes Academy",
    href: "/paths/academy/",
    body: "Practical learning paths in U.S. logistics, marketing, sales, and operations.",
  },
};

const partnershipContact = {
  label: "Partnerships & collaboration",
  href: "mailto:partnership@hermeslogisticsus.com?subject=Work%20with%20Hermes",
  value: "partnership@hermeslogisticsus.com",
  note: "Use the partnership route for agency, referral, white-label, strategic, expansion, and investment conversations.",
};

export const opportunityPages: OpportunityPage[] = [
  {
    slug: "careers",
    eyebrow: "Careers · employment",
    title: "Careers & Open Roles at Hermes",
    seoTitle: "Careers at Hermes | Logistics, Marketing, Technology & Academy",
    seoDescription: "Explore current Hermes career paths across logistics, marketing, technology, academy, sales, and operations. Review verified openings, role expectations, and truthful application boundaries.",
    summary: "Find current employee opportunities and the correct application path across the Hermes ecosystem without mixing employment with Owner-Operator or agency relationships.",
    audienceTitle: "This path is for candidates seeking an employee role.",
    audience: [
      "Candidates with recent, verifiable experience that matches a published role.",
      "People evaluating sales, operations, marketing, technology, recruiting, or other approved Hermes functions.",
      "Learners who want to understand the difference between training and an actual employment opening.",
      "Candidates who want current requirements before investing time in an application.",
    ],
    valueTitle: "What the careers path is designed to clarify",
    value: [
      "Which roles are actually published and current.",
      "What experience, language, schedule, tools, or results a role may require.",
      "Where the authoritative application source lives.",
      "How training, candidate evaluation, and employment are kept as separate states.",
    ],
    process: [
      { title: "Find a current opening", body: "Start with the governed Careers hub and use only vacancies that are visibly current and linked to a live application source." },
      { title: "Review fit before applying", body: "Compare your recent experience, schedule, communication level, tools, and measurable results with the role requirements." },
      { title: "Apply through the verified route", body: "Use the published application source or contact route. Submission begins review; it does not create an interview or employment relationship." },
    ],
    boundaries: [
      "A careers page does not guarantee that a role is open indefinitely.",
      "Training, internship-style practice, or Academy participation is not an employment offer.",
      "An application does not guarantee an interview, paid role, compensation level, or start date.",
      "Owner-Operators and carrier businesses use the separate Owner-Operator path rather than an employee application.",
    ],
    primaryCta: { label: "View Hermes Logistics careers", href: "/logistics/careers/" },
    secondaryCta: { label: "Explore Hermes Academy", href: "/paths/academy/" },
    contact: {
      label: "Careers questions",
      href: "mailto:officeus@hermeslogisticsus.com?subject=Hermes%20careers%20question",
      value: "officeus@hermeslogisticsus.com",
      note: "This verified receiving mailbox remains the recruiting fallback until a dedicated careers alias is independently proven.",
    },
    directionLinks: [directions.logistics, directions.marketing, directions.technology, directions.academy],
    faq: [
      { question: "Where are current Hermes job openings published?", answer: "Use the Hermes Careers pages and the exact external application source linked from a current vacancy. A generic company page or training page is not proof that a paid role is open." },
      { question: "Does completing Hermes Academy guarantee a job?", answer: "No. Academy training and employment are separate. Training may build relevant skills, but it does not guarantee an interview, job, compensation, or placement." },
      { question: "Are Owner-Operators employees?", answer: "No. Owner-Operator and carrier relationships are business-to-business operating arrangements and use the separate Owner-Operator opportunity path." },
    ],
    related: ["owner-operators", "agency-partners", "referral-partners"],
  },
  {
    slug: "owner-operators",
    eyebrow: "Carrier business · independent operators",
    title: "Owner-Operator Opportunities with Hermes",
    seoTitle: "Owner-Operator Opportunities | Trucking & Carrier Programs | Hermes",
    seoDescription: "Explore Hermes Owner-Operator opportunities, dispatch support, carrier fit, equipment considerations, Wisconsin recruiting, and no-forced-dispatch operating boundaries.",
    summary: "For independent truck owners evaluating carrier programs, dispatch support, equipment fit, lanes, home time, and operating structure while keeping the final business decision with the Owner-Operator.",
    audienceTitle: "This path is for truck owners operating as a business.",
    audience: [
      "Owner-Operators with their own commercial truck.",
      "Truck + trailer operators and Power Only owners whose trailer arrangement can be reviewed individually.",
      "Independent operators comparing dispatch support with an existing dispatcher or self-managed operation.",
      "Responsible drivers focused on safety, equipment maintenance, communication, and consistent service.",
    ],
    valueTitle: "What Hermes can review with an Owner-Operator",
    value: [
      "Equipment, home base, preferred lanes, schedule, experience, and safety history.",
      "Whether dispatch support is useful and which working relationship fits the operation.",
      "Load search, rate discussion, broker communication, documentation, invoicing, and back-office support where the applicable program permits.",
      "Current carrier/program fit without forcing a universal percentage or one-size-fits-all operating model.",
    ],
    process: [
      { title: "Review current recruiting scope", body: "The current verified public recruiting priority is Wisconsin. Other future markets require their own verified publication before they are represented as open." },
      { title: "Discuss the operating profile", body: "Share truck, trailer or Power Only status, home base, experience, lanes, schedule, dispatcher situation, and readiness." },
      { title: "Evaluate a compatible program", body: "Commercial terms, authority arrangements, deductions, support scope, and carrier-specific requirements are discussed before onboarding." },
    ],
    boundaries: [
      "No forced dispatch is the published Wisconsin recruiting position; the Owner-Operator keeps the final load decision where the applicable carrier program permits.",
      "No load, weekly gross, mileage, rate, dedicated freight, authority, insurance, trailer, or income is guaranteed.",
      "Power Only may be considered only where a compatible carrier/program and trailer arrangement actually exist.",
      "This is a business-to-business path, not a company-driver employment page.",
    ],
    primaryCta: { label: "View current Wisconsin Owner-Operator opportunity", href: "/careers/wisconsin-owner-operators/" },
    secondaryCta: { label: "Review Owner-Operator support", href: "/paths/logistics/carriers/owner-operators/" },
    contact: {
      label: "Owner-Operator Recruiting — Wisconsin",
      href: "tel:+14142697377",
      value: "+1 (414) 269-7377",
      note: "Central Time: Monday–Friday after 2:15 PM; Saturday–Sunday 10:00 AM–9:00 PM.",
    },
    directionLinks: [directions.logistics],
    faq: [
      { question: "Does Hermes require every Owner-Operator to own a trailer?", answer: "No universal rule is published. The current Wisconsin source requires an owned commercial truck, while truck + trailer and Power Only eligibility are reviewed individually against the available carrier program." },
      { question: "Can I keep my existing dispatcher?", answer: "That can be discussed. The operating setup is reviewed individually; Hermes does not present one dispatcher arrangement as mandatory for every Owner-Operator." },
      { question: "What percentage does an Owner-Operator receive?", answer: "There is no universal public percentage. Compensation and deductions depend on the carrier program, equipment, authority arrangement, support scope, and other agreed terms and are discussed before onboarding." },
    ],
    related: ["careers", "agency-partners", "strategic-partnerships"],
  },
  {
    slug: "agency-partners",
    eyebrow: "Agencies · operators · market builders",
    title: "Agency Partnerships with Hermes",
    seoTitle: "Hermes Agency Partnerships | Existing Agencies & Market Expansion",
    seoDescription: "Explore agency partnerships with Hermes, including existing-agency collaboration and market-launch conversations across logistics, marketing, technology, and academy directions.",
    summary: "For existing agencies, experienced operators, and market builders who want to discuss a structured relationship with Hermes rather than a generic vendor introduction.",
    audienceTitle: "This path is for organizations or operators that can own execution.",
    audience: [
      "Existing agencies with a real team, customers, distribution, operating capability, or specialized market access.",
      "Operators evaluating a Hermes agency or market-launch path.",
      "Service companies that can complement Hermes in logistics, marketing, technology, or education.",
      "Local partners who can show a credible market case rather than only request a territory.",
    ],
    valueTitle: "What an agency conversation can cover",
    value: [
      "Market fit, responsibilities, lead ownership, service boundaries, and delivery model.",
      "Existing Hermes public agency pathways in Logistics and case-by-case collaboration in other directions.",
      "Whether the relationship is referral, delivery, white-label, operating, or another approved structure.",
      "What evidence, commercial terms, legal review, and operational readiness are needed before launch.",
    ],
    process: [
      { title: "Choose the agency path", body: "Existing agencies can review the agency-partner path; market operators can review the current agency-launch path." },
      { title: "Bring evidence of capability", body: "Share team capacity, market knowledge, customers or distribution where appropriate, operating experience, and the relationship you want to build." },
      { title: "Define responsibilities before branding", body: "Brand use, territory, lead ownership, services, economics, systems, compliance, and escalation paths require explicit review and written agreement." },
    ],
    boundaries: [
      "Submitting interest does not create a franchise, territory, exclusivity right, agency appointment, or partnership.",
      "No revenue, client volume, lead volume, or market share is guaranteed.",
      "Use of Hermes branding requires approval; no party may represent itself as Hermes before the relationship is authorized.",
      "Commercial, legal, data, and service obligations are defined separately for each approved relationship.",
    ],
    primaryCta: { label: "Review existing Agency Partner path", href: "/paths/logistics/agency-partners/" },
    secondaryCta: { label: "Explore opening a Hermes agency", href: "/logistics/agency/" },
    contact: partnershipContact,
    directionLinks: [directions.logistics, directions.marketing, directions.technology, directions.academy],
    faq: [
      { question: "Is this a franchise offer?", answer: "No. This page is an invitation to discuss fit. It does not offer a franchise, protected territory, exclusivity, guaranteed economics, or automatic permission to use the Hermes brand." },
      { question: "Can an existing agency work with Hermes?", answer: "Potentially. The relationship can be reviewed based on services, market, capacity, responsibilities, data access, commercial fit, and operating standards." },
      { question: "Can I open Hermes in my city or country?", answer: "A market-launch conversation can be reviewed when there is a credible operator, team, demand case, and operating plan. Interest alone does not create approval or territory rights." },
    ],
    related: ["white-label-partners", "referral-partners", "expansion-investment"],
  },
  {
    slug: "referral-partners",
    eyebrow: "Introductions · business development",
    title: "Referral & Introducer Partnerships",
    seoTitle: "Referral Partnerships with Hermes | Clients, Carriers & Opportunities",
    seoDescription: "Discuss referral and introducer partnerships with Hermes for qualified clients, carriers, candidates, agencies, and business opportunities across the Hermes ecosystem.",
    summary: "For people and companies that can introduce qualified opportunities and want a clear, reviewable referral relationship rather than an assumed commission arrangement.",
    audienceTitle: "This path is for people who can make relevant, qualified introductions.",
    audience: [
      "Business consultants, operators, agencies, and professionals with trusted client relationships.",
      "People who can introduce qualified carriers, customers, companies, candidates, or strategic partners.",
      "Industry communities or associations exploring an introduction model.",
      "Partners who care about attribution, handoff quality, and clear boundaries around the relationship.",
    ],
    valueTitle: "What a referral relationship can define",
    value: [
      "Which Hermes direction and audience the referral program covers.",
      "What makes an introduction qualified enough for review.",
      "How attribution, privacy, consent, follow-up, and ownership of the relationship are handled.",
      "Whether any compensation applies and, if so, the approved written terms before referrals are made.",
    ],
    process: [
      { title: "Define the referral type", body: "Identify whether you refer clients, carriers, candidates, agencies, technology partners, or another opportunity type." },
      { title: "Agree on qualification and handoff", body: "Set expectations for consent, contact quality, context, attribution, and what Hermes can reasonably review." },
      { title: "Use only written commercial terms", body: "Do not assume a percentage or payment. Any referral economics must be separately approved before they are represented as available." },
    ],
    boundaries: [
      "No public referral percentage or commission is promised.",
      "An introduction does not guarantee that Hermes accepts, contacts, contracts with, or closes the referred party.",
      "Private contact data should not be shared without appropriate permission.",
      "Referral attribution and payment, if any, require approved terms and evidence of the qualifying event.",
    ],
    primaryCta: { label: "Email Partnerships about referrals", href: "mailto:partnership@hermeslogisticsus.com?subject=Hermes%20referral%20partnership" },
    secondaryCta: { label: "See all ways to work with Hermes", href: "/opportunities/" },
    contact: partnershipContact,
    directionLinks: [directions.logistics, directions.marketing, directions.technology, directions.academy],
    faq: [
      { question: "What referral commission does Hermes pay?", answer: "No universal public referral commission is offered on this page. If compensation applies to a specific program, it must be approved separately in writing before it is represented as available." },
      { question: "Can I refer candidates as well as customers?", answer: "You can propose candidate, customer, carrier, agency, or company introductions, but each category has different qualification and privacy requirements." },
      { question: "Does a referral guarantee contact or payment?", answer: "No. A referral starts review. Contact, acceptance, commercial outcome, and any payment depend on the approved program and evidence that its conditions were met." },
    ],
    related: ["agency-partners", "white-label-partners", "strategic-partnerships"],
  },
  {
    slug: "white-label-partners",
    eyebrow: "Delivery partnerships · behind another brand",
    title: "White-Label & Delivery Partnerships",
    seoTitle: "White-Label Agency & Delivery Partnerships | Hermes",
    seoDescription: "Discuss white-label marketing, technology, operations, and approved delivery partnerships where Hermes can support another agency or company under clearly defined responsibilities.",
    summary: "For agencies and companies that need a capable delivery layer behind their brand, or want Hermes to execute an approved scope while preserving clear client, data, quality, and commercial boundaries.",
    audienceTitle: "This path is for companies with a real delivery need and accountable client relationship.",
    audience: [
      "Marketing agencies that need website, SEO, social, CRM, or growth-system delivery capacity.",
      "Technology companies or consultants that need implementation, web application, automation, or workflow support.",
      "Companies that want an approved Hermes delivery scope behind an existing client relationship.",
      "Operators looking for a delivery partner rather than a reseller badge without responsibility.",
    ],
    valueTitle: "What a white-label model can define",
    value: [
      "Scope, client ownership, communication model, brand presentation, and quality control.",
      "Access to websites, systems, analytics, CRM, content, or operational data on a least-necessary basis.",
      "Delivery responsibilities, review points, acceptance criteria, change control, and escalation.",
      "Commercial terms that match the real service rather than an invented one-size-fits-all package.",
    ],
    process: [
      { title: "Bring the client/service context", body: "Explain the work, audience, required capabilities, current systems, deadlines, and who owns the client relationship." },
      { title: "Define the delivery boundary", body: "Confirm what Hermes does, what your team does, what the client sees, and which systems or data are required." },
      { title: "Approve brand, access, and terms", body: "White-label representation, credentials, data processing, service levels, payment, and acceptance must be agreed before delivery begins." },
    ],
    boundaries: [
      "White-label status is not automatic and does not authorize use of Hermes work, name, credentials, or systems without agreement.",
      "Hermes does not claim access to a client's private systems until that access is explicitly granted.",
      "No service-level, capacity, turnaround, price, or outcome is guaranteed on this public page.",
      "Logistics-related white-label scopes require separate authority, compliance, and operating review where applicable.",
    ],
    primaryCta: { label: "Discuss a white-label delivery relationship", href: "mailto:partnership@hermeslogisticsus.com?subject=Hermes%20white-label%20delivery%20partnership" },
    secondaryCta: { label: "Explore Hermes Technology", href: "/paths/technology/" },
    contact: partnershipContact,
    directionLinks: [directions.marketing, directions.technology, directions.logistics],
    faq: [
      { question: "Can Hermes work behind our agency brand?", answer: "Potentially, after the exact scope, client relationship, brand presentation, responsibilities, access, quality controls, and commercial terms are reviewed." },
      { question: "Can we give Hermes access to client accounts?", answer: "Only when access is legitimately authorized and limited to what the approved delivery scope requires. This public page does not itself grant or request credentials." },
      { question: "Is white-label pricing published?", answer: "No universal white-label pricing is published here. Pricing depends on the defined service, volume, systems, responsibilities, risk, and delivery model." },
    ],
    related: ["agency-partners", "strategic-partnerships", "referral-partners"],
  },
  {
    slug: "strategic-partnerships",
    eyebrow: "Company-to-company · long-term fit",
    title: "Corporate & Strategic Partnerships",
    seoTitle: "Corporate & Strategic Partnerships with Hermes",
    seoDescription: "Explore strategic partnerships with Hermes across logistics, marketing, technology, academy, vendors, integrations, distribution, and long-term business collaboration.",
    summary: "For companies, carriers, vendors, technology providers, associations, agencies, educators, and other organizations exploring a structured relationship with one or more Hermes directions.",
    audienceTitle: "This path is for organizations that can contribute capability, access, technology, distribution, or market value.",
    audience: [
      "Carriers, shippers, vendors, and transportation-service organizations.",
      "Technology platforms, software providers, integration partners, and implementation teams.",
      "Marketing, media, distribution, association, or community partners.",
      "Education, training, content, or professional organizations with a credible joint-use case.",
    ],
    valueTitle: "What a strategic partnership can explore",
    value: [
      "Joint workflows, integrations, distribution, operating capacity, or complementary service delivery.",
      "Where one Hermes direction is the correct owner and where a cross-direction relationship is justified.",
      "Data, system, brand, commercial, compliance, and customer-ownership boundaries.",
      "A staged pilot or proof-of-fit before either company represents a broader relationship publicly.",
    ],
    process: [
      { title: "Define the shared business problem", body: "Explain the audience, workflow, capability gap, or market opportunity the relationship should solve." },
      { title: "Identify the smallest useful collaboration", body: "Start with a bounded integration, referral, delivery, market, or operating scope that can be evaluated." },
      { title: "Scale only after evidence", body: "Expand the relationship after responsibilities, quality, economics, compliance, and actual outcomes are understood." },
    ],
    boundaries: [
      "A partnership conversation does not create exclusivity, preferred-provider status, guaranteed volume, or public co-branding rights.",
      "No integration is represented as live until it is actually configured and verified.",
      "No customer, carrier, lead, revenue, or market-share claim is implied by the existence of a discussion.",
      "Any data sharing, API access, brand use, or commercial commitment requires the appropriate written agreement.",
    ],
    primaryCta: { label: "Start a strategic partnership conversation", href: "mailto:partnership@hermeslogisticsus.com?subject=Hermes%20strategic%20partnership" },
    secondaryCta: { label: "Review all Hermes directions", href: "/opportunities/" },
    contact: partnershipContact,
    directionLinks: [directions.logistics, directions.marketing, directions.technology, directions.academy],
    faq: [
      { question: "What types of companies can partner with Hermes?", answer: "Potential partners can include transportation businesses, vendors, technology providers, agencies, associations, educators, distribution partners, and other organizations with a concrete shared-use case." },
      { question: "Does Hermes offer exclusive partnerships?", answer: "No exclusivity is promised on this page. Any exclusivity, territory, preferred status, or volume commitment would require separate review and explicit written terms." },
      { question: "Can we integrate our software with Hermes systems?", answer: "A technical integration can be discussed when there is a legitimate workflow, authorized access, security review, data boundary, and owner for implementation. A discussion is not proof that an integration is live." },
    ],
    related: ["white-label-partners", "agency-partners", "expansion-investment"],
  },
  {
    slug: "expansion-investment",
    eyebrow: "Expansion · strategic capital · market development",
    title: "Expansion & Investment Conversations",
    seoTitle: "Hermes Expansion & Investment Conversations | Strategic Growth",
    seoDescription: "Discuss Hermes market expansion, strategic capital, operating partnerships, office or market launches, and long-term business growth. No investment return or securities offer is made.",
    summary: "For experienced operators, strategic capital partners, companies, and market builders who want to explore long-term expansion with Hermes through a factual business review.",
    audienceTitle: "This path is for serious strategic conversations, not passive return promises.",
    audience: [
      "Operators with a credible plan to launch or scale a market, service, office, or operating team.",
      "Strategic capital partners who can contribute more than an expectation of guaranteed returns.",
      "Companies considering a joint operating, distribution, technology, logistics, marketing, or education expansion.",
      "Parties that can share relevant experience, resources, market access, or a concrete business thesis.",
    ],
    valueTitle: "What an expansion conversation can evaluate",
    value: [
      "Market demand thesis, customer problem, operating model, team, capabilities, and execution ownership.",
      "Which Hermes direction or combination of directions is actually relevant.",
      "Potential capital, ownership, commercial, governance, or operating structures only after professional review.",
      "Evidence gates and staged milestones before public launch or material commitments.",
    ],
    process: [
      { title: "Present the business thesis", body: "Explain the market, problem, evidence, required resources, your role, and why Hermes is relevant to the opportunity." },
      { title: "Review strategic and operating fit", body: "Separate what is already proven from assumptions about demand, economics, team capacity, legal structure, or geographic expansion." },
      { title: "Use professional diligence for material terms", body: "Ownership, capital, securities, tax, legal, governance, territory, and material financial terms require appropriate professional review and written documents." },
    ],
    boundaries: [
      "This page is not an offer to sell securities or a solicitation to invest.",
      "Hermes does not publish or guarantee an investment return, valuation, ownership percentage, dividend, exit, territory, or fundraising availability here.",
      "A conversation does not create a partnership, board role, ownership right, franchise, agency, office, or market entitlement.",
      "Any material investment or ownership structure requires separate legal, financial, tax, and commercial review.",
    ],
    primaryCta: { label: "Start an expansion or investment conversation", href: "mailto:partnership@hermeslogisticsus.com?subject=Hermes%20expansion%20or%20investment%20conversation" },
    secondaryCta: { label: "Explore agency and market partnerships", href: "/opportunities/agency-partners/" },
    contact: partnershipContact,
    directionLinks: [directions.logistics, directions.marketing, directions.technology, directions.academy],
    faq: [
      { question: "Is Hermes currently offering an investment round?", answer: "This public page does not state that a financing round, security, share allocation, valuation, or investment offer is open. It provides a route for strategic conversations that require separate diligence." },
      { question: "Can I invest and receive a guaranteed return?", answer: "No. Hermes does not publish or guarantee returns, dividends, valuation growth, exit outcomes, or ownership economics on this page." },
      { question: "Can we open a Hermes market together?", answer: "A market expansion can be discussed when there is a credible operator, demand thesis, execution plan, resources, and fit. Discussion alone does not grant territory, brand rights, or approval." },
    ],
    related: ["agency-partners", "strategic-partnerships", "white-label-partners"],
  },
];

export const opportunityPageBySlug = new Map(opportunityPages.map((page) => [page.slug, page]));
