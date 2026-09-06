# Hermes HyperFrames vertical reel v1

First deterministic 9:16 template for the Hermes AI Video Factory.

## Contract

- composition: `hermes-vertical-reel-v1`
- authored output: 1080x1920, 30 fps, 15 seconds
- renderer: HyperFrames
- motion runtime: GSAP 3.14.2, vendored locally before checks/renders
- brand source: `video-factory/brands/hermes/DESIGN.md`
- business input source: `VideoJob` / `SceneSpec`

The template only accepts scalar HyperFrames variables. Arrays/objects stay in the vendor-neutral `VideoJob`; `buildHyperFramesTemplateVariables()` flattens the render-facing values.

## Variables

Core variables are supplied by the provider adapter: `job_id`, `brand_id`, `purpose`, `template_version`, `hook`, `body`, `cta`.

Template-specific variables are optional `VideoJob.templateVariables`: `brand_label`, `eyebrow`, `metric_value`, `metric_label`, `footer`, `accent`.

Do not place current performance or market metrics in `metric_value` unless the job already passed the existing evidence gate.

## Local / CI workflow

```bash
npm install --no-audit --no-fund
npm run prepare:vendor
npm run check
npm run render:draft
```

The final render command uses `sample.variables.json` with `--strict-variables`. Production upload must package the prepared local `vendor/gsap.min.js`; do not replace it with a remote CDN dependency.
