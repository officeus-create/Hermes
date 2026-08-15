# Issue #511: [HC-MOBILE-RELEASE] Hermes Connect Public Beta — Web, iOS & Android

**Owner:** `Hermes Connect - Автономная Разработка`  
**Reviewer:** `Синхронизация Базы Знаний Агентов`  
**Status:** `IN_PROGRESS`  

---

## 1. Goal & Three-Phase Release Strategy
To bypass store funding constraints and immediately start collecting real user feedback without sacrificing the modular architecture, Hermes Connect is delivered following a three-phase distribution policy:

* **Phase 1: Web & PWA Release (CURRENT)**
  * **Web App:** Production website deployment at `hermeslogisticsus.com`.
  * **iPhone (iOS):** Standard Web App / PWA (Progressive Web App) home screen installation using the high-fidelity Safari Guided Installation simulator.
  * **Android:** The Web App/PWA path remains available. Direct APK distribution is paused until a fresh canonical build passes release-signing, checksum, and clean-device gates.
* **Phase 2: App Store & Google Play Releases (DEFERRED FOR FUNDING)**
  * Uploading and publishing native Capacitor builds (`.ipa` / App Store, `.aab` / Google Play) as soon as developer account fees are funded.
* **Phase 3: Desktop Expansion (TRIGGERED AT ~10 REAL BETA USERS)**
  * Packaging and distributing standalone macOS and Windows desktop apps. (Do not start desktop development now).

---

## 2. Platform Release Matrix

| Platform | Distribution Channel | Current Status | Notes / Truth Boundaries |
| :--- | :--- | :---: | :--- |
| **Web** | Production Web App | `LIVE` | Operating at `hermeslogisticsus.com` |
| **iPhone PWA** | Web-based Home Screen Install | `LIVE` | Uses the canonical responsive runtime and Safari Add to Home Screen path. |
| **Android APK** | Direct Web Download (.apk) | `BLOCKED` | The stale debug-signed artifact was retired on 2026-08-15. Restore a direct link only after all release gates pass. |
| **Android AAB** | Google Play Store Build (.aab) | `NOT_STARTED` | Build and verification have not been completed; store submission remains deferred. |
| **App Store** | Official Apple App Store | `DEFERRED` | Postponed until official Apple Developer account is funded. |
| **Google Play** | Official Google Play Store | `DEFERRED` | Postponed until official Google Developer account is funded. |
| **macOS** | Desktop Standalone App | `NOT_STARTED` | Phase 3 Expansion (Trigger: ~10 real active beta users). |
| **Windows** | Desktop Standalone App | `NOT_STARTED` | Phase 3 Expansion (Trigger: ~10 real active beta users). |

---

## 3. Release Policy & Monetization (FREE Public Beta)
> [!IMPORTANT]  
> All public customer pricing, subscriptions, Starter/Pro/Enterprise plans, and payment requirements are **DEFERRED** (marked internally as `MONETIZATION DEFERRED — CEO APPROVAL REQUIRED`).
> 
> The app is positioned and structured as **Free Public Beta** / **Free early access**. No user payment credentials or card details shall be requested during onboarding or workspace interactions.
> 
> **CRITICAL TRUTH BOUNDARY:**
> * Direct Android `.apk` distribution is permitted only for a current canonical build that is release-signed, checksum-recorded, and clean-device verified. No APK is currently offered.
> * iOS `.ipa` files **must NOT** be advertised as general web downloads, as standard public iOS Safari users cannot install native iOS packages directly from web links. iPhone users will be routed exclusively to Web/PWA installation.

* **Onboarding Path:** Register ➔ Choose Business Type ➔ Direct entry into Workspace.
* **Badges & CTAs:** Primary CTAs updated to `Start Free Beta` / `Open Hermes Connect`.
* **Store Configuration:** 
  * App Store: `Price = Free`
  * Google Play: `App = Free`

---

## 4. Native App Utility (Deferred for Phase 2 Store Release)
To eventually comply with Apple App Store Guideline 4.2 (Minimum Functionality) in Phase 2, the future native wrapping must support rich user utility beyond a simple website wrapper. These items do not block the current Web/PWA path; Android direct distribution has the separate release gates below:

* **Offline Shell & State:** Graceful transition to offline mode when network connection is lost. Persistent UI states so the app stays functional.
* **Local Persistence:** Local workspace state cached securely across reboots using persistent client-side storage.
* **Native Share:** Integration of the native share dialog (`@capacitor/share`) for sharing documents, diagnostics, and reports.
* **Native Haptics:** Subtle tactile haptic feedback (`@capacitor/haptics`) triggered on successful critical actions.
* **Deep Links & Universal Links:** Direct navigation from inbound URLs to specific app modules.
* **Mobile Navigation:** High-fidelity fixed-bar bottom navigation (`.mobile-nav`) with reliable stacking context and pointer-event interception safeguards.

---

## 5. Platform Specifications & Build Prerequisites

### A. Apple iOS Build (DEFERRED FOR PHASE 2)
* **Status:** `DEFERRED` (Not required for Phase 1 release).
* **Toolchain:** Xcode 26+ and iOS 26 SDK or later (required only for native App Store Connect listing).
* **Identifier (Bundle ID):** `com.hermeslogistics.connect` (**PROVISIONAL** - must be audited and verified against the official Apple Developer account first in Phase 2).
* **Aesthetics:** High-priority eager LCP image preloads, native status bar color synchronization (Pearl Light / Obsidian Dark), viewport-safe layout boundaries, and proper keyboard-avoidance behavior.

### B. Android Google Play Build (APK Blocked / AAB Deferred)
* **Status:** `BLOCKED` for direct `.apk` distribution; `DEFERRED` for Play Store `.aab` publication.
* **Target SDK:** Android 16 / API Level 36.
* **Identifier (Package ID):** `com.hermeslogistics.connect` (**PROVISIONAL** - must be audited and verified against the Google Play Console in Phase 2).
* **Artifact:** No public APK. The prior beta binary was removed because it bundled retired runtimes and used the Android Debug certificate.
* **Aesthetics:** Custom Adaptive Icon with background/foreground layers, standard splash screen API, and hardware Back Button interception/navigation handling.

### C. 2026-08-15 APK Audit Evidence

The retired `public/downloads/hermes-connect-beta.apk` was inspected before removal:

* **SHA-256:** `32e1c3cf35e77ac789cb8459dfddcfed6088e04e6aa4f113b34a95e8daf26b99`
* **Package configuration:** `com.hermeslogistics.connect`, source version code `1`, version name `1.0`, target SDK 36.
* **Provenance:** bundled web files matched source commit `bb27c196ff11fabcb5c14c9d356633c6b9dd58fe` from 2026-08-14.
* **Staleness:** the package contained 25 retired Brand V1/V2/mobile paths removed by the canonical consolidation.
* **Signing:** APK Signature Scheme v2 was present, but the certificate subject and issuer were `C=US,O=Android,CN=Android Debug`; certificate SHA-256 was `5b116b7f6393b7f1f0b87a5ab2d5045d73f3726ba4824687cf82cd62582eab72`.
* **Install evidence:** no clean-device installation evidence exists for that artifact.

A replacement may be published only when it bundles the current canonical runtime, uses a controlled release key, records the APK checksum and certificate fingerprint, and passes install/launch/core-flow smoke on a clean supported Android device.

---

## 6. Workstream Links & Relations

```mermaid
graph TD
  509["PR #509 (superseded)"] -.->|Do not merge| Main["main (canonical)"]
  Main -->|Create Release Branch| 511["Issue #511 (Mobile Release)"]
  510["Issue #510 (Repair Beta)"] -->|Independent Design & Prep| 511
```

* **PR #509 (Brand Funnel):** Closed as superseded. It predates the canonical runtime and must not be merged wholesale.
* **Issue #510 (Repair Shop Pilot) & #511 (Mobile Release) Autonomy:** Repair Shop distribution and a fresh Android release build continue from `main`; neither should create another versioned application tree.

---

## 7. Store Prerequisites & Account Audit (DEFERRED FOR PHASE 2)

| Platform | Prerequisite Element | Required Action / Status |
| :--- | :--- | :--- |
| **Apple** | Developer Membership | `DEFERRED` - Confirm active status (Organization or Individual) post-funding. |
| **Apple** | App Store Connect App | `DEFERRED` - Create listing, configure Bundle ID, configure App Privacy, Support & Marketing URLs. |
| **Apple** | Signing & Team | `DEFERRED` - Register signing certificate, provisioning profile, and configure Xcode signing. |
| **Google** | Play Console Account | `DEFERRED` - Identify developer account type (Organization or Personal). |
| **Google** | Play 14-day Tester Clock | `DEFERRED` - If a new personal account (post Nov 13, 2023), Closed Testing with 12 opted-in testers for 14 continuous days is required in Phase 2. *Does not block Phase 1 APK direct website download.* |
| **Google** | Play Console Draft | `DEFERRED` - Set up store listing draft, Content Rating, Data Safety form, and upload AAB. |

---

## 8. Quality Gate (Phase 1 Readiness)

| Priority | Classification | Description / Criteria |
| :---: | :--- | :--- |
| **P0** | **Release Blocker** | App crashes on launch, stale/duplicate bundled runtime, debug or unverified signing certificate, missing checksum/install evidence, broken core guest booking, paywalls or upgrade prompts visible (must be FREE), missing Privacy Policy, broken Support URL. |
| **P1** | **Beta Fix (Post-Release)** | Minor visual layout shifts, cosmetic alignment on specific mobile viewports, offline cache optimization. These do not block the current Web/PWA path and may be addressed after a verified Android beta release. |
| **P2** | **Improvement** | Non-critical feature enhancements, advanced telemetry reports, expanded transition animations. |

---

## 9. Feedback Loop & Analytics Compliance
* **Controlled Non-PII Telemetry:** GA4 analytics tracking must utilize distribution sources: `web`, `ios_app`, or `android_app`.
* **Zero PII Exposure:** Personal user details (name, email, exact location, phone number) or raw sales rep codes must **never** be transmitted to GA4.
* **Private Feedback Loop:** User feedback text (free-text entries regarding usability or missing features) must go to a secure, private receiver/storage path, completely bypassed from public analytics streams.
