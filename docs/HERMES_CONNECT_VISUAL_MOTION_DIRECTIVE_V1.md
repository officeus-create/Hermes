# Hermes Connect Visual Motion Directive V1 (Issue #488)

## 🎯 Mandatory Product & Visual Requirements

### 1. Typography & Contrast
- **Base Body Text**: Increase base text size across all components for superior readability (min `text-sm` for secondary text, `text-base` / `text-lg` for body content).
- **Accents**: Amplify Iris (`#7C5CFF`), Ocean Blue (`#5AC8FA`), and Sage Green (`#34C759`) visual accents.

### 2. Motion & Dynamic Backgrounds
- **Animated Hermes Flow Waves**: Integrate smooth SVG/CSS gradient waves in the background that subtly flow and respond to pointer hover.
- **3D Knot / Orbital Geometry**: Re-introduce translucent 3D knot loops and orbital objects.
- **Interactive Micro-Animations**:
  - Card hover, lift, tilt, parallax, and pointer-reactive depth shifts.
  - Ambient breathing background even when the pointer is idle.
- **Reduced Motion Support**: Implement `@media (prefers-reduced-motion: reduce)` to pause ambient animations for accessibility compliance.
- **Mobile Touch Adaptation**: Ensure mobile touch events trigger corresponding visual active/highlight states.

### 3. Hermes Intelligence Branding Guard
- **Primary AI Launcher**: The floating Hermes Knot (`intelligent loop`) MUST be the sole button for launching **Hermes Intelligence**.
- **Removal**: Eliminate generic AI / Gemini icons as primary faces of the product.
- **UI Status Transparency**: UI badges MUST state `Demo` or `Simulated` unless verified by a backend integration.
