export type AcademySubsiteCard = {
  title: string;
  body: string;
};

export type AcademySubsiteLink = AcademySubsiteCard & {
  href: string;
};

export type AcademySubsitePage = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  schemaType: "Course" | "WebPage" | "CollectionPage";
  teaches?: string[];
  audienceTitle: string;
  audienceIntro: string;
  audience: AcademySubsiteCard[];
  modulesTitle: string;
  modulesIntro: string;
  modules: AcademySubsiteCard[];
  processTitle: string;
  processIntro: string;
  process: AcademySubsiteCard[];
  faq: Array<{ question: string; answer: string }>;
  related: AcademySubsiteLink[];
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
  boundary: string;
};

export const academySubsitePages: Record<string, AcademySubsitePage> = {
  logistics: {
    slug: "us-logistics-operations",
    title: "U.S. Logistics Operations Training | Hermes Business Academy",
    description:
      "Practical U.S. logistics education covering dispatch foundations, carrier and broker communication, documents, equipment logic, negotiation practice, and operating routines.",
    eyebrow: "Hermes Business Academy · U.S. Logistics Operations",
    h1: "Learn how U.S. logistics work moves from first conversation to completed load.",
    intro:
      "This program connects terminology, communication, equipment logic, documents, negotiation, and operating routines into one reviewable workflow. It is designed for international learners preparing to understand or support U.S.-market logistics work.",
    schemaType: "Course",
    teaches: [
      "Dispatch foundations",
      "Carrier and broker communication",
      "Documents and load lifecycle",
      "Equipment and lane logic",
      "Negotiation practice",
      "Operating routines",
    ],
    audienceTitle: "Who this program is designed for",
    audienceIntro:
      "Readiness depends on language, schedule, discipline, recent experience, and the exact participation model approved for the cohort or practice group.",
    audience: [
      { title: "Career starters", body: "Learners who need a structured introduction to U.S. logistics roles, vocabulary, workflow, and professional boundaries." },
      { title: "Bilingual professionals", body: "Russian-, Ukrainian-, or other language speakers who can communicate in English and want to work with the U.S. market." },
      { title: "Existing specialists", body: "Dispatch, sales, recruiting, or operations participants who need stronger process ownership and negotiation discipline." },
      { title: "Future team leaders", body: "People preparing to coordinate quality, handoffs, reporting, and team execution after proving reliable specialist capability." },
    ],
    modulesTitle: "Six connected learning areas",
    modulesIntro:
      "The exact exercises and review depth depend on the approved program format. These areas describe the public curriculum direction, not a promise of access to live operations.",
    modules: [
      { title: "Dispatch foundations", body: "Roles, responsibilities, load lifecycle, carrier control, information flow, and the difference between coordination and operating authority." },
      { title: "Carrier and broker communication", body: "Professional calls and messages, qualification questions, requirement confirmation, escalation, follow-up, and claim-safe language." },
      { title: "Equipment and lane logic", body: "Equipment classes, capacity limits, deadhead awareness, timing, route questions, pickup and delivery constraints, and fit review." },
      { title: "Documents and setup", body: "Rate confirmations, setup packets, insurance certificates, W-9 controls, transport documents, invoicing workflow, and secure document handling." },
      { title: "Negotiation practice", body: "Preparation, questions, objections, counteroffers, boundaries, carrier approval, and review of recorded or written scenarios when available." },
      { title: "Operating rhythm", body: "Priorities, status updates, quality checks, handoffs, KPI interpretation, attendance, and preparation for U.S. time-zone workflows." },
    ],
    processTitle: "How capability develops",
    processIntro:
      "The Academy uses a progression from context to reviewed application. Advancement is based on demonstrated work quality and participation, not on time alone.",
    process: [
      { title: "1. Orientation and readiness", body: "Confirm goals, English level, schedule, recent experience, technology access, and the appropriate participation model." },
      { title: "2. Awareness", body: "Learn terminology, roles, public boundaries, standard workflows, and why each step matters." },
      { title: "3. Understanding", body: "Connect communication, equipment, documents, decisions, risks, and measurement through examples and guided review." },
      { title: "4. Application", body: "Complete scenarios, scripts, calculations, document reviews, recordings, or other approved exercises." },
      { title: "5. Feedback and correction", body: "Receive reviewer feedback when available, correct recurring errors, and document the next improvement target." },
      { title: "6. Human progression decision", body: "A reviewer decides whether the learner should continue, repeat, change direction, or pause. No role or employment is automatic." },
    ],
    faq: [
      { question: "What English level is required?", answer: "The suitable level depends on the role and program format. U.S.-market calls and negotiation normally require functional spoken English. The application records the learner's current level for human review." },
      { question: "Can I join without logistics experience?", answer: "A beginner may apply, but admission, group placement, exercise level, and continuation depend on readiness, schedule, language, and the current approved format." },
      { question: "Does the program guarantee a job or income?", answer: "No. Education and practice can build capability and evidence of readiness, but employment, income, clients, certification, promotion, group access, and future paid work are not guaranteed." },
      { question: "Will learners work with real carrier or shipment data?", answer: "Not by default. Public pages and exercises must use approved, synthetic, anonymized, or explicitly permitted information. Private operational data requires separate authorization and controls." },
      { question: "What is the difference between a paid cohort and free practice?", answer: "They are separate participation models. A paid cohort requires an approved offer with scope, dates, price, payment, refund, and capacity terms. Free practice uses application, eligibility, attendance, quality, and conduct rules." },
    ],
    related: [
      { title: "How training works", body: "Review the learning stages, feedback model, participation rules, and public boundaries.", href: "/academy/how-training-works/" },
      { title: "Dispatch vs self-dispatch", body: "Use the carrier comparison guide as a practical operating lesson.", href: "/logistics/resources/dispatch-service-vs-self-dispatch/" },
      { title: "Broker setup packet", body: "Study secure setup documents, verification, ownership, and refresh controls.", href: "/logistics/resources/broker-setup-packet-checklist/" },
      { title: "Academy resources", body: "Open the curated public learning library.", href: "/academy/resources/" },
    ],
    primaryAction: { label: "Start Academy application", href: "/academy/apply/?program=us-logistics-operations#contact" },
    secondaryAction: { label: "Review how training works", href: "/academy/how-training-works/" },
    boundary:
      "Program dates, live exercises, mentors, prices, capacity, languages, schedules, and participation terms are published only after the exact offer is approved. No employment, income, certification, client, promotion, or access-duration guarantee.",
  },
  marketing: {
    slug: "marketing",
    title: "Practical Marketing Training | Hermes Business Academy",
    description:
      "Practical marketing education covering positioning, website-first content, social distribution, lead journeys, sales follow-up, analytics, and review-first AI automation.",
    eyebrow: "Hermes Business Academy · Marketing",
    h1: "Connect content, distribution, qualification, sales follow-up, and measurement.",
    intro:
      "The Marketing program teaches how a service business turns a useful idea into a canonical website asset, platform-specific distribution, a clear customer journey, reviewed sales follow-up, and privacy-safe measurement.",
    schemaType: "Course",
    teaches: [
      "Positioning and offers",
      "Website-first content",
      "Social distribution",
      "Lead journeys",
      "Sales follow-up",
      "Analytics and improvement",
    ],
    audienceTitle: "Who this program is designed for",
    audienceIntro:
      "The program is suitable for learners and working professionals who want to understand the complete growth system rather than treat social posting as an isolated task.",
    audience: [
      { title: "Marketing beginners", body: "Learners who need a clear foundation in audience, offer, content, channels, qualification, and measurement." },
      { title: "SMM specialists", body: "Practitioners ready to connect Instagram, Facebook, Threads, LinkedIn, X, video, and website content into one system." },
      { title: "Sales and account teams", body: "People responsible for qualification, follow-up, objections, handoffs, and converting attention into reviewed opportunities." },
      { title: "Business operators", body: "Owners or managers who need reusable content operations, clear KPI, privacy boundaries, and accountable execution." },
    ],
    modulesTitle: "Six connected learning areas",
    modulesIntro:
      "Each module produces reusable outputs for the website, social channels, sales enablement, and future automation while keeping human approval active.",
    modules: [
      { title: "Positioning and offer", body: "Audience, problem, promise boundaries, service scope, differentiation, proof, objections, and the next useful action." },
      { title: "Website-first content", body: "Canonical pages, search intent, useful answers, cases, FAQ, video pages, internal links, CTA, and content ownership." },
      { title: "Platform distribution", body: "Distinct Facebook, Instagram, Threads, LinkedIn, X, video, Stories, and email adaptations instead of identical cross-posting." },
      { title: "Lead journey", body: "Landing pages, trust, qualification, forms, preview, explicit handoff, human response, and friction review." },
      { title: "Sales follow-up", body: "Response structure, discovery questions, objection handling, next steps, CRM discipline, and outcome-safe communication." },
      { title: "Analytics and improvement", body: "UTM taxonomy, privacy-safe events, source quality, inquiry quality, review cycles, and decisions based on evidence rather than vanity metrics." },
    ],
    processTitle: "Build one complete growth loop",
    processIntro:
      "The practical objective is to connect a useful source asset to distribution, a destination, a reviewed handoff, and measurable improvement.",
    process: [
      { title: "1. Diagnose", body: "Identify the audience, business problem, current channels, evidence, offer, and conversion gap." },
      { title: "2. Build the canonical asset", body: "Create or improve the website page that owns the topic, answers the question, links related resources, and presents the correct CTA." },
      { title: "3. Create channel variants", body: "Prepare platform-specific hooks, explanations, visuals, CTA, and privacy-safe tracked links." },
      { title: "4. Review and distribute", body: "Check claims, rights, account ownership, duplicate risk, and destination readiness before publishing." },
      { title: "5. Qualify and follow up", body: "Route responses and inquiries to the correct human process with clear context and next steps." },
      { title: "6. Measure and improve", body: "Compare sessions, engagement, CTA actions, inquiry quality, handoff, and approved business outcomes without promising results." },
    ],
    faq: [
      { question: "Is this only an SMM course?", answer: "No. Social content is one distribution layer. The program connects positioning, website content, social channels, qualification, sales follow-up, analytics, and review-first automation." },
      { question: "Will the Academy publish content automatically?", answer: "Not in the first release. Learners can prepare drafts and workflows, but external posting, messages, ads, CRM writes, and API actions remain behind human approval and separate access controls." },
      { question: "Are marketing results guaranteed?", answer: "No. Reach, traffic, inquiries, sales, cost, ranking, and revenue depend on the offer, audience, execution, competition, platform behavior, and other external factors." },
      { question: "Can existing social posts become website content?", answer: "Yes, after rights, privacy, evidence, freshness, duplication, and canonical ownership review. Similar thin posts should be clustered into one strong asset rather than published as many weak pages." },
      { question: "Does the program include AI automation?", answer: "AI may support research, classification, drafting, quality review, and preview workflows. Live integrations, autonomous publishing, messages, payments, or customer-data actions require separate approval." },
    ],
    related: [
      { title: "Search-to-inquiry checklist", body: "Review the full path from organic discovery to human follow-up.", href: "/resources/search-to-inquiry-conversion-checklist/" },
      { title: "Technical SEO checklist", body: "Audit crawl, indexation, architecture, performance, schema, trust, and measurement.", href: "/resources/technical-seo-checklist/" },
      { title: "Website project brief", body: "Turn a business objective into a reviewable website plan.", href: "/resources/website-project-brief-template/" },
      { title: "Academy resources", body: "Open the curated public learning library.", href: "/academy/resources/" },
    ],
    primaryAction: { label: "Start Academy application", href: "/academy/apply/?program=marketing#contact" },
    secondaryAction: { label: "Review how training works", href: "/academy/how-training-works/" },
    boundary:
      "The current page describes the public curriculum direction. Dates, mentors, live tools, prices, capacity, certificates, access, and exact deliverables require an approved cohort offer. No traffic, lead, sale, income, employment, client, or revenue guarantee.",
  },
  method: {
    slug: "how-training-works",
    title: "How Training Works | Hermes Business Academy",
    description:
      "Review Hermes Business Academy methodology, readiness, awareness, understanding, application, feedback, participation rules, and progression boundaries.",
    eyebrow: "Hermes Business Academy · Method",
    h1: "Training moves from context to reviewed application.",
    intro:
      "Hermes Business Academy uses a practical sequence: readiness review, awareness, understanding, application, feedback, and a human progression decision. The exact scope depends on the approved program and participation model.",
    schemaType: "WebPage",
    audienceTitle: "What learners should understand before applying",
    audienceIntro:
      "The Academy is a structured learning and practice environment. It is not an automatic hiring, income, certification, promotion, or business-opportunity program.",
    audience: [
      { title: "Readiness matters", body: "Language, schedule, technology, discipline, recent experience, and goals affect the suitable path and exercise level." },
      { title: "Practice is reviewed", body: "Exercises may include scripts, scenarios, documents, recordings, analysis, briefs, and revisions when the format supports them." },
      { title: "Participation has rules", body: "Attendance, deadlines, respectful communication, privacy, evidence, quality, and inactivity requirements may apply." },
      { title: "Progression is human", body: "A reviewer decides whether a learner should continue, repeat, change direction, pause, or complete the approved stage." },
    ],
    modulesTitle: "Three learning stages",
    modulesIntro:
      "Every stage should produce a clearer understanding of responsibilities, decisions, boundaries, and the evidence needed for reliable work.",
    modules: [
      { title: "Awareness", body: "Understand the role, market context, terminology, workflow, responsibilities, privacy, claims, and quality standard." },
      { title: "Understanding", body: "Connect examples, decisions, systems, communication, measurement, risks, and the reasons behind the process." },
      { title: "Application", body: "Complete approved exercises, explain decisions, receive correction when available, and demonstrate repeatable capability." },
    ],
    processTitle: "Participation lifecycle",
    processIntro:
      "A clear lifecycle protects learners, reviewers, operations, and public claims while keeping expectations realistic.",
    process: [
      { title: "1. Application", body: "Provide the minimum qualification details needed to review language, experience, goals, schedule, program fit, and contact route." },
      { title: "2. Human review", body: "The Academy reviews the current offer, eligibility, available format, and whether another path or later start is more appropriate." },
      { title: "3. Orientation", body: "Approved participants receive the applicable scope, schedule, tools, rules, public boundaries, and first tasks." },
      { title: "4. Learning and practice", body: "Participants complete the approved material and exercises and communicate status according to the program rules." },
      { title: "5. Feedback and quality", body: "Reviewers may identify recurring errors, required revisions, evidence gaps, and the next practice objective." },
      { title: "6. Continue, revise, pause, or complete", body: "Participation status is based on the approved model, quality, attendance, conduct, and available capacity. No external outcome is automatic." },
    ],
    faq: [
      { question: "How long does training take?", answer: "Duration depends on the exact program, current cohort or practice format, starting level, schedule, and progression. A public duration is stated only when the specific offer is approved." },
      { question: "Are lessons live or recorded?", answer: "The delivery mix may include written material, video, group sessions, scenarios, recordings, assignments, and reviewer feedback. The exact combination is confirmed for the approved format." },
      { question: "What happens if a participant becomes inactive?", answer: "The applicable participation rules may require status updates, attendance, task completion, or communication. Inactivity can lead to a pause or removal, but the exact rule must be published for the program." },
      { question: "Does completion provide certification?", answer: "No certification is represented unless an approved offer explicitly defines the issuer, assessment, criteria, validity, and terms. Current public pages do not promise certification." },
      { question: "Can the Academy guarantee employment?", answer: "No. Training, feedback, practice, and capability development do not guarantee employment, income, clients, promotion, access to operations, or future paid work." },
    ],
    related: [
      { title: "U.S. Logistics Operations", body: "Review the public logistics curriculum and readiness boundaries.", href: "/academy/us-logistics-operations/" },
      { title: "Marketing", body: "Review the complete website-to-distribution growth curriculum.", href: "/academy/marketing/" },
      { title: "Academy application", body: "Prepare the qualification details for human review.", href: "/academy/apply/" },
      { title: "Academy resources", body: "Use public guides and checklists before or during application.", href: "/academy/resources/" },
    ],
    primaryAction: { label: "Start Academy application", href: "/academy/apply/#contact" },
    secondaryAction: { label: "Return to Academy hub", href: "/paths/academy/" },
    boundary:
      "The methodology describes the public operating model. It does not publish a current cohort, start date, price, seat, instructor assignment, review frequency, certificate, job, income, promotion, or access guarantee.",
  },
  resources: {
    slug: "resources",
    title: "Academy Learning Resources | Hermes Business Academy",
    description:
      "A curated public learning library for U.S. logistics operations, marketing, website planning, SEO, conversion, document controls, and professional decision-making.",
    eyebrow: "Hermes Business Academy · Public Resources",
    h1: "Use practical guides before, during, and after your application.",
    intro:
      "The Academy resource library connects public Hermes guides to structured learning objectives. Resources are educational and do not replace legal, tax, insurance, safety, regulatory, banking, employment, or professional advice.",
    schemaType: "CollectionPage",
    audienceTitle: "How to use this library",
    audienceIntro:
      "Start with the guide closest to your current question, complete the review prompts, and use the related program page to understand the wider workflow.",
    audience: [
      { title: "Prepare", body: "Learn terminology, gather required facts, identify missing evidence, and understand the public boundaries before applying." },
      { title: "Practice", body: "Turn a guide into a scenario, checklist, explanation, comparison, or review exercise." },
      { title: "Discuss", body: "Bring specific questions and explain the reasoning behind your proposed answer or decision." },
      { title: "Refresh", body: "Check dates, official sources, process changes, and whether the guide still matches the current approved workflow." },
    ],
    modulesTitle: "Current public learning collections",
    modulesIntro:
      "These collections reuse existing indexable assets instead of creating thin duplicate lesson pages.",
    modules: [
      { title: "Carrier readiness", body: "New-authority readiness, dispatch versus self-dispatch, broker setup packets, equipment capacity, and carrier-controlled decisions." },
      { title: "Marketing and conversion", body: "Technical SEO, website briefs, search-to-inquiry conversion, evidence, CTA, forms, handoff, and measurement." },
      { title: "Website and systems planning", body: "Project objectives, audiences, content, integrations, migration, analytics, privacy, launch boundaries, and reusable architecture." },
      { title: "Professional communication", body: "Questions, confirmation, objections, escalation, documentation, status updates, and claim-safe explanations." },
    ],
    processTitle: "Suggested learning sequence",
    processIntro:
      "The sequence can support self-study and reviewer-led exercises without implying enrollment or access to private materials.",
    process: [
      { title: "1. Choose one question", body: "Select a real learning goal rather than opening every resource at once." },
      { title: "2. Read the canonical guide", body: "Identify definitions, dependencies, exclusions, CTA, and linked commercial or program owner." },
      { title: "3. Summarize in your own words", body: "Explain the process, why it matters, and what cannot be promised." },
      { title: "4. Apply to a scenario", body: "Use synthetic or approved information to complete a checklist, comparison, brief, or communication draft." },
      { title: "5. Review errors", body: "Check missing facts, unsupported assumptions, privacy exposure, duplicate work, and unclear handoff." },
      { title: "6. Connect the next resource", body: "Follow one useful internal link to the related service, program, or deeper guide." },
    ],
    faq: [
      { question: "Are all Academy resources free?", answer: "The public pages in this library are accessible without enrollment. Private lessons, reviews, group access, tools, or cohort material may use separate approved terms." },
      { question: "Can public resources replace the full program?", answer: "They can support preparation and self-study, but they do not provide the exact sequence, review, participation rules, or approved exercises of a cohort or practice format." },
      { question: "May I copy the resources into my own course?", answer: "Do not republish or present Hermes material as your own. Linking, quoting short portions with attribution, or other reuse must follow applicable rights and owner permission." },
      { question: "Are the logistics resources legal or regulatory advice?", answer: "No. They are operational education. Confirm legal, tax, insurance, safety, regulatory, banking, and accounting requirements with official sources and qualified professionals." },
    ],
    related: [
      { title: "New-authority checklist", body: "Review authority, insurance, equipment, operating area, documents, and control.", href: "/logistics/resources/new-authority-car-hauler-readiness-checklist/" },
      { title: "Dispatch comparison", body: "Compare self-dispatch, dispatch support, and a hybrid workflow.", href: "/logistics/resources/dispatch-service-vs-self-dispatch/" },
      { title: "Search-to-inquiry checklist", body: "Connect search discovery to trust, CTA, qualification, and human follow-up.", href: "/resources/search-to-inquiry-conversion-checklist/" },
      { title: "Technical SEO checklist", body: "Review crawl, indexation, architecture, performance, schema, and measurement.", href: "/resources/technical-seo-checklist/" },
    ],
    primaryAction: { label: "Start Academy application", href: "/academy/apply/#contact" },
    secondaryAction: { label: "Return to Academy hub", href: "/paths/academy/" },
    boundary:
      "Public resources are educational references. They do not guarantee admission, mentor review, employment, income, certification, operational access, legal compliance, ranking, traffic, leads, clients, or business results.",
  },
};

export const academySubsiteNavigation: AcademySubsiteLink[] = [
  { title: "U.S. Logistics Operations", body: "Dispatch, communication, documents, equipment logic, negotiation, and operating routines.", href: "/academy/us-logistics-operations/" },
  { title: "Marketing", body: "Website-first content, social distribution, lead journeys, sales follow-up, and measurement.", href: "/academy/marketing/" },
  { title: "How training works", body: "Readiness, learning stages, exercises, feedback, rules, and progression boundaries.", href: "/academy/how-training-works/" },
  { title: "Apply", body: "Prepare qualification details for a preview-first human review.", href: "/academy/apply/" },
  { title: "Resources", body: "Use curated public guides and checklists without duplicating the canonical source pages.", href: "/academy/resources/" },
];
