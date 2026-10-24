# Hermes AI Control — Android phone companion preview (2026-10-20)

**State: NOT INSTALLED ON USER PHONE / SERVER NOT YET CONNECTED.** This is an Android companion to the existing Paperclip experiment (PR #1972), NOT a new orchestrator or an alternative to One Brain.

Purpose: one app icon that opens an explicitly provided HTTPS Paperclip server in the system browser. The application does not communicate with Hermes services by itself, has no permissions, never stores credentials, and never runs agents or background processes. It saves only the validated HTTPS host for convenience. Auth occurs in the browser.

## Install/test workflow
- Isolated project under `experiments/android-ai-control/`, no changes to existing Hermes Connect Android app, no network permission, no APK bundled in production website.
- Android SDK 35, Java 17, Gradle 8.11.1, AGP 8.10.1.
- `node experiments/android-ai-control/tests/contract.test.mjs` checks safety invariants.
- CI builds **debug-signed preview only** using `gradle -p experiments/android-ai-control :app:assembleDebug`. CI stores an expiring APK artifact; it is NOT a Google Play release and MUST NOT be distributed to external customers.
- To install: download artifact from authenticated GitHub Actions; transfer the APK to the owner's Android device; review origin; enable install-from-this-source ONLY for the chosen installer when Android requests it; install the APK; consider disabling the permission afterward. ADB direct install requires a physically/USB-authorized Android Debug Bridge device and explicit connection evidence. A ChatGPT chat alone is not device-administration access.
- Opening the app before the private server is configured shows a truthful waiting state. Paste a **https://** authenticated private URL (prefer HTTPS via Tailscale Serve / DNS backed by a valid certificate), tap Open Panel. Do not paste board-claim URLs, magic login links, URLs with query tokens, HTTP localhost, credentials or VPN public proxy URLs.
- Production: use authenticated/private Paperclip with a vetted always-on server, an approved host, reviewed access/rate limits and a phone connecting via authenticated private network. Read https://github.com/paperclipai/paperclip/blob/master/doc/DEPLOYMENT-MODES.md. No running server exists solely because a CI proof passed.
- Do not rebrand this as a native Paperclip client. It is a companion launcher. A PWA installed from the actual HTTPS dashboard may be preferable once available.

## Required release gates
1. APK builds in clean CI, source and manifest contract pass.
2. Downloadable debug artifact verified, checksum reported.
3. Actual Android phone install and launch evidence (user or device owner).
4. Authorized permanent host with secure HTTPS / authentication.
5. One real synthetic One Brain task and independent review; no external messages or paid inference.
6. Only then consider an owner-approved signed app release or installable PWA; avoid a parallel product.

Rollback: uninstall the companion app. No Hermes or Paperclip database is affected.

## Quality, app size and CI speed — 20 October 2026

- The initial PR APK build and SHA256 succeeded. An expensive Android emulator run showed `adb install` **Success** and `MainActivity` **Resumed**; only its attempt to write screenshot directly under `/sdcard/` failed with **Permission denied** (CI run 39452750117). This is NOT a proven app crash.
- The capture path was fixed to `adb exec-out screencap -p > .../phone-emulator.png`. The full screenshot step has **not yet been rerun**; explicitly do not call it green on this evidence alone.
- Every PR now runs source safety tests, Gradle debug APK compilation, SHA256 and **500,000-byte debug APK hard cap**. Emulator boot (over 12 minutes in the previous CI job) is **manual workflow_dispatch only**. Passing release checks remain fast, while full Android UI tests are opt-in.
- Verified new quick CI: https://github.com/officeus-create/Hermes/actions/runs/39461871836 — success. It proves build and size gate, not direct install onto owner's Realme.
- Runtime uses the system browser; there is **no WebView, background service, polling, app network permission, third-party analytics or heavyweight JS** inside the launcher. Session/auth state belongs to the separate Paperclip HTTPS site.
- Real phone cold-start, battery, memory and network measurements **not yet established**. Do not claim native speed advantage from emulator or APK size alone.

**Next:** owner installs debug APK on a specifically authorized Android device, validates HTTPS Paperclip origin after a secure server is available, and records sanitized install/open proof. Do not enable public unsecured server just to make the app seem usable.
