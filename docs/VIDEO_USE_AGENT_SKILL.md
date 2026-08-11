# Video Use agent skill

## Purpose

Use the open-source [`browser-use/video-use`](https://github.com/browser-use/video-use) skill when the owner asks an agent to edit raw footage, assemble Reels/Shorts/TikToks, cut talking-head videos, add subtitles, color grade footage, or create programmatic overlays/animations.

The upstream project is designed for shell-capable agents including Codex and Claude Code. It turns raw footage into an `edit/final.mp4` workflow using transcript-first editing, FFmpeg, and optional HyperFrames / Remotion / Manim animation slots.

This is an **agent-side production tool**, not a website runtime dependency. Do not add it to the Astro application bundle or deploy it to Cloudflare Pages.

## Canonical upstream

- Repository: `https://github.com/browser-use/video-use`
- Skill file: `SKILL.md`
- Install instructions: `install.md`
- Editing helpers: `helpers/`
- Optional Manim skill: `skills/manim-video/`

Always read the current upstream `install.md` and `SKILL.md` before first use because the project can change independently of Hermes.

## One-command Hermes setup

From the Hermes repository on the Mac:

```bash
bash tools/install-video-use.sh
```

The installer:

1. clones or fast-forwards `browser-use/video-use` into `~/Developer/video-use`;
2. installs its Python package with `uv sync` when `uv` is available, otherwise `python3 -m pip install -e .`;
3. checks that `ffmpeg` and `ffprobe` exist;
4. registers the whole upstream directory as a skill for any detected Codex and/or Claude Code installation by symlink;
5. does **not** request, print, store, or validate an API key;
6. does **not** transcribe footage or spend ElevenLabs/Scribe credits.

The whole directory is symlinked instead of only `SKILL.md` because the skill relies on adjacent helpers.

## Credential boundary

Transcription uses ElevenLabs Scribe. The repository must never contain a real `ELEVENLABS_API_KEY`.

When the owner explicitly starts the first real video job, the local coding agent may ask for the key at that moment and store it only in the external local file:

```text
~/Developer/video-use/.env
```

Never echo the key back to logs, never write it into Hermes, never commit the `.env` file, and never ask for a standing credential in advance.

## Agent activation rule

When a request is clearly about editing or producing a video from footage:

1. Check whether `~/.codex/skills/video-use` or `~/.claude/skills/video-use` resolves.
2. If missing, follow this runbook and `tools/install-video-use.sh`.
3. Read the upstream `SKILL.md` before editing.
4. Work from the user's footage directory, not from the Hermes repo.
5. Keep all generated session artifacts under `<videos_dir>/edit/`.
6. Inventory and transcribe sources, then propose a plain-English editing strategy.
7. Wait for approval of that strategy before cutting.
8. Render a preview, self-evaluate cut boundaries and subtitle/overlay alignment, fix issues, then produce `final.mp4`.
9. Do not commit raw footage, transcripts, rendered videos, credentials, or external `video-use` source into the Hermes repo unless the owner explicitly requests a separate archival task.

## Production rules to preserve

The upstream `SKILL.md` is the source of truth. In particular, preserve these correctness constraints:

- never cut inside a word; use transcript word boundaries;
- use small padding around cut edges to absorb ASR timestamp drift;
- apply short audio fades at segment boundaries to avoid pops;
- apply subtitles after overlays in the final filter chain;
- calculate subtitle timing on the output timeline after cuts;
- cache transcripts and do not re-transcribe unchanged sources;
- keep source footage untouched;
- verify the rendered output before presenting it;
- require strategy approval before executing the cut.

## Ready-to-use setup prompt for Codex / Claude Code

Use this when the coding agent has shell access and the skill has not yet been installed:

> Set up the current `browser-use/video-use` skill for this machine. First read `https://github.com/browser-use/video-use/blob/main/install.md` and `SKILL.md`. Use `~/Developer/video-use` as the external install directory and register the whole directory in the current agent's skills directory (`~/.codex/skills/video-use` for Codex and/or `~/.claude/skills/video-use` for Claude Code). Verify `ffmpeg`, `ffprobe`, and the Python dependencies, but do not transcribe any footage and do not spend API credits during installation. Do not put credentials or generated media in the Hermes repository. If ElevenLabs is required for the first real transcription, ask me for the key only at that moment and keep it in the external local `.env`. After setup, tell me exactly what is ready and wait for footage.

## First editing prompt

After installation, start the agent from the folder containing the raw video files and say, for example:

> Inventory these takes and propose the strongest 30–45 second vertical Reel. Remove false starts and dead space, preserve the strongest hook and natural reactions, use readable subtitles, and add only overlays that improve comprehension. Do not cut anything until you show me the editing strategy and I approve it.

The expected output directory is:

```text
<videos_dir>/edit/
```

with the final deliverable at:

```text
<videos_dir>/edit/final.mp4
```
