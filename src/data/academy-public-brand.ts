import type { AcademySubsitePage } from "./academy-subsite";

const LEGACY_ACADEMY_MASTER_NAME = "Hermes Business Academy";
const PUBLIC_ACADEMY_MASTER_NAME = "Hermes Academy";

const normalizeString = (value: string) => value.replaceAll(LEGACY_ACADEMY_MASTER_NAME, PUBLIC_ACADEMY_MASTER_NAME);

export const normalizeAcademyPublicContent = (content: AcademySubsitePage): AcademySubsitePage => ({
  ...content,
  title: normalizeString(content.title),
  description: normalizeString(content.description),
  eyebrow: normalizeString(content.eyebrow),
  h1: normalizeString(content.h1),
  intro: normalizeString(content.intro),
  audienceTitle: normalizeString(content.audienceTitle),
  audienceIntro: normalizeString(content.audienceIntro),
  audience: content.audience.map((item) => ({ title: normalizeString(item.title), body: normalizeString(item.body) })),
  modulesTitle: normalizeString(content.modulesTitle),
  modulesIntro: normalizeString(content.modulesIntro),
  modules: content.modules.map((item) => ({ title: normalizeString(item.title), body: normalizeString(item.body) })),
  processTitle: normalizeString(content.processTitle),
  processIntro: normalizeString(content.processIntro),
  process: content.process.map((item) => ({ title: normalizeString(item.title), body: normalizeString(item.body) })),
  faq: content.faq.map((item) => ({ question: normalizeString(item.question), answer: normalizeString(item.answer) })),
  related: content.related.map((item) => ({ ...item, title: normalizeString(item.title), body: normalizeString(item.body) })),
  primaryAction: { ...content.primaryAction, label: normalizeString(content.primaryAction.label) },
  secondaryAction: { ...content.secondaryAction, label: normalizeString(content.secondaryAction.label) },
  boundary: normalizeString(content.boundary),
  teaches: content.teaches?.map(normalizeString),
});

export const academyPublicBrandContract = {
  masterName: PUBLIC_ACADEMY_MASTER_NAME,
  legacyMasterName: LEGACY_ACADEMY_MASTER_NAME,
  rule: "Legacy Academy naming may remain in historical/private data, but canonical public Academy output must use Hermes Academy.",
} as const;
