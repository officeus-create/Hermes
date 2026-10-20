import React, { lazy, Suspense, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

// Isolated review-only Vite app, not an Astro site route or Home PR.
const effects = {
  marketing: {
    heading: 'Marketing · restrained green horizon',
    description: 'Shader study for a quiet editorial background; not a production color approval.',
    View: lazy(() => import('@designcodeio/threeui/components/EmeraldHorizonBackground')
      .then(m => ({ default: m.EmeraldHorizonBackground }))),
    props: { speed: 0.15, glow: 0.3, waveScale: 0.5, vignette: 0.25 }
  },
  technology: {
    heading: 'Technology · data field',
    description: 'Subtle interactive dots for a CRM illustration, not a fake product metric.',
    View: lazy(() => import('@designcodeio/threeui/components/DotMatrixBackground')
      .then(m => ({ default: m.DotMatrixBackground }))),
    props: { speed: 0.12, opacity: 0.22, mouseAmount: 0.02, gridScale: 40 }
  },
  academy: {
    heading: 'Academy · continuity',
    description: 'Alternative dot-matrix treatment; human progress content remains real HTML.',
    View: lazy(() => import('@designcodeio/threeui/components/DotMatrixBackground')
      .then(m => ({ default: m.DotMatrixBackground }))),
    props: { speed: 0.08, opacity: 0.13, mouseAmount: 0, gridScale: 26, hue: 42 }
  }
};

function allowedToAnimate() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (navigator.connection?.saveData) return false;
  // Battery/network-first: a GPU shader is never a prerequisite for mobile navigation.
  if (window.matchMedia('(max-width: 767px), (pointer: coarse)').matches) return false;
  if (navigator.connection?.effectiveType && /^(slow-2g|2g)$/.test(navigator.connection.effectiveType)) return false;
  if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4) return false;
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch { return false; }
}

function App() {
  const [direction, setDirection] = useState('marketing');
  const [active, setActive] = useState(false);
  const [capability, setCapability] = useState(null);
  const current = effects[direction];
  const Preview = current.View;
  function activate() { const ok = allowedToAnimate(); setCapability(ok); setActive(ok); }
  function select(value) { setDirection(value); setActive(false); setCapability(null); }
  return <main className="shell">
    <div className="eyebrow">HERMES · INTERNAL MOTION LAB · NOT PRODUCTION</div>
    <h1>Subtle motion, clear commercial meaning.</h1>
    <p className="intro">ThreeUI Community technical experiment. Production navigation, SEO, lead capture and PR #1970 remain unchanged.</p>
    <div className="tabbar" aria-label="Choose a design study">
      {Object.keys(effects).map(key => <button key={key} type="button" aria-pressed={key === direction} onClick={() => select(key)}>{key}</button>)}
    </div>
    <section className="scene" aria-label={current.heading}>
      {active && capability && <div className="visual" aria-hidden="true"><Suspense fallback={null}><Preview {...current.props}/></Suspense></div>}
      <div className="copy">
        <span className="pill">Lab preview · synthetic content</span>
        <h2>{current.heading}</h2>
        <p>{current.description}</p>
        <button className="cta" type="button" onClick={active ? () => setActive(false) : activate}>
          {active ? 'Pause animation' : 'Activate WebGL preview'}
        </button>
        {capability === false && <p role="status" className="status">Static fallback: Reduced Motion, Save-Data or WebGL unavailable.</p>}
      </div>
    </section>
    <p className="note">Isolated technical sample, not a new SEO landing page, sales proof or client presentation. Motion is opt-in.</p>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
