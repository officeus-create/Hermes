import { academyPublicPathOverrides } from "./academy-public";
import { site, type PathDetail } from "./site";

const publicDirectionOverrides: Partial<Record<PathDetail["id"], Partial<PathDetail>>> = {
  logistics: {
    category: "Hermes Logistics",
    brandLabel: "Hermes Logistics",
  },
  marketing: {
    category: "Hermes Marketing",
    brandLabel: "Hermes Marketing",
    programLabel: "Digital Growth · SEO · Content · Demand",
    overview: "Hermes Marketing connects website strategy, SEO, social media, positioning, campaigns, lead journeys, sales follow-up, and measurement. Work begins with the business objective and current constraints, then moves toward a focused system rather than a collection of disconnected tactics.",
    directContacts: [
      {
        label: "Marketing Inquiries",
        value: "officeus@hermeslogisticsus.com",
        href: "mailto:officeus@hermeslogisticsus.com?subject=Hermes%20Marketing%20Inquiry",
        note: "Email-only international coordination",
      },
    ],
    socialLinks: [],
  },
  academy: {
    category: "Hermes Academy",
    brandLabel: "Hermes Academy",
    directContacts: [
      {
        label: "Academy Inquiries",
        value: "officeus@hermeslogisticsus.com",
        href: "mailto:officeus@hermeslogisticsus.com?subject=Hermes%20Academy%20Inquiry",
        note: "Email-only international coordination",
      },
    ],
  },
  technology: {
    category: "Hermes Technology",
    brandLabel: "Hermes Technology",
    programLabel: "IT Development · AI · APIs · CRM · Automation",
    cta: "Explore Technology",
    overview: "Hermes Technology turns a defined business process into custom software. Work can begin with a website, portal, CRM module, workflow automation, business assistant, or industry-specific product, then expand through tested stages and explicit maturity labels.",
    faq: [
      { question: "Who is Hermes Technology for?", answer: "Initial solutions are designed for service businesses such as fitness clubs, trainers, coaches, salons, cosmetologists, logistics teams, and professional services." },
      { question: "Do we have to build a large platform first?", answer: "No. Work begins with the smallest useful version of the customer or internal workflow, followed by real testing." },
      { question: "Can existing tools be connected?", answer: "Where suitable, the system can connect Google Workspace, CRM, booking, payment, communication, and reporting tools through supported integrations. Availability is verified for the specific project before an integration is represented as live." },
    ],
    directContacts: [
      {
        label: "Technology Inquiries",
        value: "officeus@hermeslogisticsus.com",
        href: "mailto:officeus@hermeslogisticsus.com?subject=Hermes%20Technology%20Inquiry",
        note: "Email-only international coordination",
      },
    ],
  },
};

export const publicPaths: PathDetail[] = site.paths.map((path) => {
  const directionOverride = publicDirectionOverrides[path.id] ?? {};
  const academyOverride = path.id === "academy" ? academyPublicPathOverrides : {};

  return {
    ...path,
    ...directionOverride,
    ...academyOverride,
  };
});

export const publicPathById = (id: string) => publicPaths.find((path) => path.id === id);
