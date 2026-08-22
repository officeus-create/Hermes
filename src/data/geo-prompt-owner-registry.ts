import {
  aiVisibilityPrompts,
  type AiVisibilityDirection,
  type AiVisibilityIntent,
  type AiVisibilityLanguage,
  type AiVisibilityPrompt,
} from "./ai-visibility-scorecard.ts";

export interface GeoPromptOwnerRecord {
  canonicalOwner: string;
  promptCount: number;
  promptIds: string[];
  prompts: string[];
  directions: AiVisibilityDirection[];
  languages: AiVisibilityLanguage[];
  intents: AiVisibilityIntent[];
  geographies: string[];
  weeklyPromptCount: number;
  monthlyPromptCount: number;
  expectedFacts: string[];
  prohibitedClaims: string[];
  multiDirection: boolean;
  multiLanguage: boolean;
  multiIntent: boolean;
}

const unique = <T>(values: T[]) => [...new Set(values)];

export const buildGeoPromptOwnerRegistry = (
  prompts: AiVisibilityPrompt[] = aiVisibilityPrompts,
): GeoPromptOwnerRecord[] => {
  const groups = new Map<string, AiVisibilityPrompt[]>();

  for (const prompt of prompts) {
    if (!prompt.canonicalOwner.startsWith("/")) {
      throw new Error(`AI visibility prompt ${prompt.id} has a non-site-relative canonical owner`);
    }
    groups.set(prompt.canonicalOwner, [...(groups.get(prompt.canonicalOwner) ?? []), prompt]);
  }

  return [...groups.entries()]
    .map(([canonicalOwner, ownerPrompts]) => {
      const directions = unique(ownerPrompts.map((item) => item.direction));
      const languages = unique(ownerPrompts.map((item) => item.language));
      const intents = unique(ownerPrompts.map((item) => item.intent));

      return {
        canonicalOwner,
        promptCount: ownerPrompts.length,
        promptIds: ownerPrompts.map((item) => item.id),
        prompts: ownerPrompts.map((item) => item.prompt),
        directions,
        languages,
        intents,
        geographies: unique(ownerPrompts.map((item) => item.geography)),
        weeklyPromptCount: ownerPrompts.filter((item) => item.cadence === "weekly").length,
        monthlyPromptCount: ownerPrompts.filter((item) => item.cadence === "monthly").length,
        expectedFacts: unique(ownerPrompts.flatMap((item) => item.expectedFacts)),
        prohibitedClaims: unique(ownerPrompts.flatMap((item) => item.prohibitedClaims)),
        multiDirection: directions.length > 1,
        multiLanguage: languages.length > 1,
        multiIntent: intents.length > 1,
      };
    })
    .sort((left, right) => right.promptCount - left.promptCount || left.canonicalOwner.localeCompare(right.canonicalOwner));
};

export const geoPromptOwnerRegistry = buildGeoPromptOwnerRegistry();

export const findGeoOwnerForPrompt = (promptId: string) => {
  const owner = geoPromptOwnerRegistry.find((record) => record.promptIds.includes(promptId));
  if (!owner) throw new Error(`Unknown AI visibility prompt: ${promptId}`);
  return owner;
};

export const geoPromptCoverageSummary = () => ({
  totalPrompts: aiVisibilityPrompts.length,
  canonicalOwners: geoPromptOwnerRegistry.length,
  multiIntentOwners: geoPromptOwnerRegistry.filter((owner) => owner.multiIntent).length,
  multiLanguageOwners: geoPromptOwnerRegistry.filter((owner) => owner.multiLanguage).length,
  multiDirectionOwners: geoPromptOwnerRegistry.filter((owner) => owner.multiDirection).length,
  weeklyPrompts: aiVisibilityPrompts.filter((prompt) => prompt.cadence === "weekly").length,
  monthlyPrompts: aiVisibilityPrompts.filter((prompt) => prompt.cadence === "monthly").length,
});