# Hermes Accessibility & Interaction Audit — 2026-09-01

Status: ACTIVE PRODUCTION RULE
Scope: shared public paths, Hermes Connect shell, Repair Shop private workspace, Academy private workspace, AI Connect, and current division-color application.

## 1. Keyboard focus

Current shared coverage is structurally sound:

- public direction pages use a visible `2px` focus outline keyed to the route signal with `3px` offset;
- Hermes Connect applies one shared visible focus rule to links, buttons, summaries, inputs, selects and textareas;
- forced-colors mode replaces decorative focus styling with the system `Highlight` color;
- Repair private forms preserve explicit focus borders/rings after the Pearl convergence;
- Academy form controls use explicit focus border/ring treatment and minimum control heights;
- the shared header/mobile menu restores focus on Escape and closes outside-click menus without trapping keyboard users.

Rule: a hover treatment is never sufficient evidence of keyboard accessibility. Every new interactive primitive must retain a visible `:focus-visible` state.

## 2. Motion

Current shared coverage:

- Hermes Connect disables the intelligence-core animation and interaction transitions under `prefers-reduced-motion: reduce`;
- the public Connect header disables header transitions in reduced-motion mode;
- Marketing social-card motion introduced in PR #944 is disabled under reduced motion;
- AI Connect access-state transitions are disabled under reduced motion;
- touch/hover-none contexts suppress decorative hover transforms on major Connect cards.

Rule: motion may reinforce hierarchy, but no action, state, navigation cue or content disclosure may depend on animation alone.

## 3. High contrast / forced colors

Current Connect shell provides a forced-colors fallback and removes decorative intelligence-core visuals. Touched division-context and private Repair controls retain explicit system borders in forced-colors mode.

Rule: glass, glow, gradient and color-mix treatments are enhancement layers. Boundaries and focus must remain understandable when those effects disappear.

## 4. Semantic division-color contrast

The canonical semantic colors are navigation/context signals, not universal text colors.

Approximate WCAG contrast against `#FFFFFF`:

| Semantic token | Hex | Contrast vs white | Safe default use on Pearl |
| --- | --- | ---: | --- |
| Logistics | `#1E88FF` | 3.49:1 | border, icon, dot, large emphasis; not normal small body text |
| Marketing | `#00C853` | 2.24:1 | atmosphere, border, fill, state signal; not normal text |
| Academy | `#7C5CFF` | 4.35:1 | UI signal / larger text; normal small text should use a darker text variant |
| Technology | `#FF7A00` | 2.61:1 | atmosphere, border, fill, state signal; not normal text |

Existing darker semantic text examples are much safer on light surfaces:

- Repair blue text `#125FB7` on white: ~6.28:1;
- success text `#18785B` on white: ~5.42:1;
- muted ink `#4F5D73` on Pearl: ~6.18:1;
- general muted `#657083` on Pearl: ~4.63:1.

The shared Connect keyboard focus violet `#6C56E8` on Pearl is ~4.70:1.

### Production rule

Do not bind `color: var(--hermes-marketing)` or `color: var(--hermes-technology)` to normal-size Pearl text merely to express the division. Use the semantic color for border/background/dot/atmosphere and a contrast-safe text token for copy. If a division-colored text treatment is needed, define and test a dedicated darker text token rather than changing the master semantic color.

## 5. Mobile target density

Current minimums / hardening:

- Academy buttons: >=44px;
- Academy fields: >=46px;
- Repair private primary/secondary/danger actions hardened to >=44px in PR #944;
- Repair availability native time inputs hardened to >=44px and `min-width:0`;
- Connect family-navigation targets reach 40–42px in its compact horizontal rail and retain focus/scroll cues;
- major conversion actions generally target 48px.

Follow-up: real authenticated iPhone/Android smoke tests remain useful for native time/select rendering and PWA/browser chrome behavior.

## 6. Conclusion

No global accessibility restyle is justified. The system already has shared focus, forced-colors and reduced-motion layers. The important next discipline is to preserve them and prevent semantic division colors from being misused as low-contrast body text.

`NEED FROM OWNER LATER:` real-device authenticated smoke tests when convenient; no owner input is required for the code-level accessibility rules above.
