// Shared chrome for server-rendered Hermes Catalog profile pages.

// Search snippets cut off past ~160 characters; trim at a word boundary.
export function conciseDescription(text, max = 160) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const atWord = cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.—–-]+$/, "");
  return `${atWord || cut}…`;
}

// The approved Hermes brand mark, shared with the main site header.
export const HERMES_MARK_IMG = '<img class="hermes-mark" src="/brand/hermes-mark.svg" alt="" width="32" height="32" decoding="async">';
export const HERMES_MARK_CSS = ".brand{display:inline-flex;align-items:center;gap:10px}.hermes-mark{display:block;width:32px;height:32px;border-radius:8px;flex:none}";
