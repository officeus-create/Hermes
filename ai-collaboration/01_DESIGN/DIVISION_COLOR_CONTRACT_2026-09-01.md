# Hermes Division Color Contract — 2026-09-01

Status: CANONICAL MAPPING RECOVERED
Application status: CONTEXTUAL ROLLOUT PENDING

## Exact mapping
| Division | Canonical token | Hex | Historical role |
| --- | --- | --- | --- |
| Logistics | `--hermes-logistics` | `#1E88FF` | movement, speed, reliability, scale |
| Marketing | `--hermes-marketing` | `#00C853` | growth, reach, attention, brand creation |
| Academy | `--hermes-academy` | `#7C5CFF` | knowledge, development, learning, future |
| Technology / IT & Product | `--hermes-technology` | `#FF7A00` | technology, innovation, AI, automation |

Current product aliases:
- Repair Shops -> Logistics blue via `--hermes-repair`.
- AI Product -> Technology orange via `--hermes-ai-product`.

Beauty has no approved canonical color. Do not infer one.

## Source-of-truth implementation
`src/styles/hermes-brand-system.css` already contains the same four exact semantic values. Therefore this task is a reconciliation, not a new palette proposal.

## Application rule
The division color is a navigation/context signal, not a full visual takeover.

Recommended use:
- small brand/context accent;
- selected navigation state;
- small chips/status framing;
- restrained ambient gradient/noise;
- contextual Option 02 material variant after visual validation.

Avoid:
- repainting full Pearl pages green/blue/orange/violet;
- changing Option 02 geometry;
- replacing the Hermes intelligence blue/cobalt/violet spectrum everywhere;
- forcing the semantic division color into strong art-directed sections that already work;
- inventing a Beauty color.

## Important distinction
The current public path art direction can use additional atmospheric colors (for example the liked Marketing pink/magenta section) without changing the canonical Marketing semantic token. Art direction and navigation semantics are related but are not the same layer.

## Rollout gate
Before applying contextual Option 02 variants globally, compare at minimum:
- public header;
- public Connect banner;
- private workspace switcher;
- 1440px;
- 390px;
- light/Pearl;
- dark/Obsidian;
- small-size legibility.
