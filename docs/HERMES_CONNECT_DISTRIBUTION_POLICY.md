# CEO Distribution Policy — Phased Release

**Status**: `CANONICAL OWNER-APPROVED POLICY`  
**Date**: 2026-08-14  
**Primary Agent**: Antigravity  
**Project**: `hermes-connect-next`  
**Role**: Primary Hermes Connect Product Implementation  

---

## 1. New Canonical Release Sequence

### PHASE 1 — NOW (Free Public Beta)
Hermes Connect must be available from the Hermes website in three distinct user paths:

*   **Web App**:
    *   Open directly in browser.
    *   Works seamlessly on both desktop and mobile browsers.
*   **iPhone / iOS**:
    *   Until official Apple App Store distribution is funded/available, use the installable Web App / PWA path.
    *   **Website CTA**: `"Install on iPhone"` (Provides clear, high-fidelity *Add to Home Screen* guided instructions).
    *   **Do NOT** offer a generic public `.ipa` download from the website.
*   **Android**:
    *   Produce a signed release APK that can be downloaded directly from the Hermes website.
    *   **Website CTA**: `"Download for Android"`
    *   Also produce `.aab` (Android App Bundle) and keep it ready for future Google Play publication.

#### Store Status
*   **Apple App Store** = `DEFERRED — DEVELOPER ACCOUNT FUNDING`
*   **Google Play** = `DEFERRED — DEVELOPER ACCOUNT FUNDING`
*   *Note: Do not let this developer-account funding block the Public Beta release.*

#### Website Download Center
Create a clear, beautiful Hermes Connect distribution block/page featuring:
1.  **Open in Browser**
2.  **Install on iPhone**
3.  **Download for Android**
*   *Note: Detect device where useful, but never prevent a user from accessing another option.*
*   **iPhone Guidelines**: Explain *Add to Home Screen* / installed Web App PWA behavior.
*   **Android Guidelines**: Provide a real APK download link only after the APK has been built, signed, and verified.
*   **Desktop Guidelines**: Web App remains the current supported desktop product.

#### Free Public Beta Principles
All Phase-1 distribution is **100% FREE**:
*   No checkout.
*   No subscription billing.
*   No in-app purchases (IAP).
*   No customer payments or pricing gates.

---

### PHASE 2 — STORE DISTRIBUTION (Deferred)
When developer-account funding is approved:
*   **Apple**: Migrate/add official App Store distribution.
*   **Google**: Migrate/add official Google Play distribution.
*   **Website CTAs** will become:
    *   `"Download on the App Store"`
    *   `"Get it on Google Play"`
    *   *(while keeping "Open Web App" as a standard option)*

---

### PHASE 3 — DESKTOP APPS (Future Sprint)
*   **Trigger**: Approximately **10 real active Beta users** and enough feedback to stabilize the core web product.
*   **Platforms**:
    *   *Hermes Connect for macOS*
    *   *Hermes Connect for Windows*
*   **Rule**: **Do NOT** create separate product logic. Reuse the same Hermes Connect frontend/product architecture and shared data contracts. Select the lightest maintainable desktop wrapper (e.g., Electron, Tauri, or similar shell) after evaluating the existing stack.
*   **Constraint**: Desktop app development **must NOT** begin before Phase 1 distribution is fully working.

---

## 2. Current Engineering Priorities

1.  **Web Beta Live**: Deliver stable desktop and mobile browser experience.
2.  **iPhone PWA Install Flow**: Provide premium step-by-step safari simulator guide.
3.  **Android Signed APK Direct Download**: Build and sign a direct `.apk` payload.
4.  **Android AAB Ready**: Ensure `.aab` is prepared for future Google Play Store submission.
5.  **Feedback Collection**: Maintain high-quality feedback widgets and capture user telemetry.
6.  **First ~10 Users**: Focus on onboarding and stabilizing the product for our first 10 pilot clients.
7.  **Fix High-Value Problems**: Address errors rapidly as reported in `ERROR_REGISTER.md`.
8.  **macOS + Windows Packaging**: Transition to Phase 3 only after the above steps are certified.
9.  **App Store / Google Play**: Transition to Phase 2 as soon as developer accounts are funded.

---

## 3. Policy Execution Metrics

*   **Web Production URL**: `https://connect.hermeslogisticsus.com/` (Active Pages Routing)
*   **iPhone Install Flow Status**: `TESTED & VERIFIED` (Integrated custom iOS Safari Simulator modal and floating install drawer widget).
*   **Android APK Path/Build Status**: `PENDING SIGNED BINARY PACKAGING` (Capacitor assets compiled and synced to `/android`).
*   **Android AAB Status**: `PENDING GRADLE ARCHIVE`
*   **Download Page URL**: `https://connect.hermeslogisticsus.com/download` (Awaiting routing activation in Phase 1 website rollout).
*   **Signing Status**: `DEVELOPMENT / UNSIGNED` (Awaiting release signing credentials).
*   **Feedback Flow Status**: `TESTED & VERIFIED` (Dynamic floating 5-star & binary utility feedback loops pushing to dataLayer telemetry).
*   **First-User Readiness**: `HIGH` (Onboarding flows, multi-vertical switcher modals, and simulator routes fully covered).
*   **Blockers**: None (Developer accounts pending funding).
*   **Branch/SHA/CI**: `feature/hermes-connect-brand-funnel-unification` / Verified GREEN in GitHub Actions.
