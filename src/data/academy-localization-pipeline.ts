export const academyLocalizationPipeline = [
  { id:"source", label:"Approved source", detail:"Use owner-approved Hermes training, public evidence or sanitized internal material only." },
  { id:"sanitize", label:"Privacy & rights", detail:"Remove personal/private data and confirm the material may be reused for public training content." },
  { id:"facts", label:"Current-fact review", detail:"Separate historical examples from current policy, pricing, employment, product and compliance claims." },
  { id:"translate", label:"Localization", detail:"Adapt the lesson to the target language and search intent without changing the underlying program truth." },
  { id:"native_qa", label:"Native-language QA", detail:"Review meaning, terminology, readability and culturally misleading phrasing before release." },
  { id:"publish", label:"Publication approval", detail:"A human reviewer approves the exact public page before it becomes indexable." },
] as const;

export type AcademyLocalizationGate = {
  sourceApproved:boolean; sanitized:boolean; currentFactsReviewed:boolean; translated:boolean; nativeQa:boolean; publicationApproved:boolean;
};
export const academyLocalizationPublishable = (g:AcademyLocalizationGate) =>
  g.sourceApproved && g.sanitized && g.currentFactsReviewed && g.translated && g.nativeQa && g.publicationApproved;
