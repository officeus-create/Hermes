// Consequential Action Safety Guardrails

export class SafetyGuard {
  static evalAction(prompt) {
    const lower = prompt.toLowerCase();

    // 1. Prohibited Medical Diagnosis & Prescription
    if (lower.includes('diagnose') || lower.includes('prescribe medication') || lower.includes('cure disease')) {
      return {
        allowed: false,
        reason: 'Hermes Connect is a fitness and training platform, not a medical diagnostic system. High-risk medical decisions require licensed physician review.'
      };
    }

    // 2. Consequential State Changes require Human Confirmation
    if (lower.includes('delete client') || lower.includes('charge credit card') || lower.includes('sign contract automatically')) {
      return {
        allowed: false,
        reason: 'Consequential financial, legal, or deletion actions require direct human confirmation and cannot be executed autonomously.'
      };
    }

    return { allowed: true };
  }
}
