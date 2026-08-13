// Hermes AI Router — Specialized Agent Dispatcher

import { TrainerCopilot } from './copilot.js';
import { ClientAssistant } from './clientAssistant.js';
import { ScienceAgent } from './scienceAgent.js';
import { SafetyGuard } from './safety.js';

export class HermesAIRouter {
  static async route(agentType, prompt, context = {}) {
    // 1. Enforce Consequential Action Safety Boundaries
    const safetyCheck = SafetyGuard.evalAction(prompt);
    if (!safetyCheck.allowed) {
      return {
        success: false,
        warning: true,
        content: `⚠️ Safety Notice: ${safetyCheck.reason}`,
        requiresHumanReview: true
      };
    }

    // 2. Dispatch to Specialized Assistant
    switch (agentType) {
      case 'trainer_copilot':
        return await TrainerCopilot.process(prompt, context);
      case 'client_assistant':
        return await ClientAssistant.process(prompt, context);
      case 'science_agent':
        return await ScienceAgent.process(prompt, context);
      default:
        return {
          success: true,
          content: 'Hermes AI Router: Please select a specialized assistant (Trainer Copilot, Client Assistant, or Science Agent).'
        };
    }
  }
}
