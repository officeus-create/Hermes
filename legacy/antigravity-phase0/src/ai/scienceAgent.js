// Science & Research Agent — Accredited Evidence Registry

import { store } from '../core/store.js';

export class ScienceAgent {
  static async process(prompt, context = {}) {
    const knowledge = store.getState().scienceKnowledge;
    const lower = prompt.toLowerCase();

    const match = knowledge.find(k =>
      lower.includes(k.topic) ||
      lower.includes(k.title.toLowerCase()) ||
      (lower.includes('rest') && k.topic === 'muscle_hypertrophy') ||
      (lower.includes('protein') && k.topic === 'protein_nutrition') ||
      (lower.includes('sleep') && k.topic === 'recovery_sleep')
    ) || knowledge[0];

    return {
      success: true,
      agentName: 'Science Research Agent',
      content: `### 🔬 Scientific Evidence Report: ${match.title}\n\n` +
        `**Evidence Level**: \`${match.evidenceLevel}\`\n\n` +
        `**Key Finding**: ${match.summary}\n\n` +
        `**Practical Coaching Application**: ${match.practicalApplication}\n\n` +
        `**Primary Sources Cited**:\n` +
        match.primarySources.map(s => `• *${s}*`).join('\n')
    };
  }
}
