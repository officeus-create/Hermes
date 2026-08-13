// Trainer Copilot — Client Check-in Summaries & Program Drafts

import { store } from '../core/store.js';

export class TrainerCopilot {
  static async process(prompt, context = {}) {
    const state = store.getState();
    const clientId = context.clientId || 'cli_david_chen';
    const client = state.clients.find(c => c.id === clientId) || state.clients[0];
    const checkIn = state.checkIns.find(c => c.clientId === client.id);

    if (prompt.toLowerCase().includes('check-in') || prompt.toLowerCase().includes('summarize')) {
      const isOverdue = !checkIn || new Date(checkIn.submittedAt) < new Date(Date.now() - 7 * 86400000);
      return {
        success: true,
        agentName: 'Trainer Copilot',
        content: `**Client Summary: ${client.name}**\n\n` +
          `• **Status**: ${client.status.toUpperCase()} ${isOverdue ? '(⚠️ Overdue Check-in)' : ''}\n` +
          `• **Goal**: ${client.primaryGoal}\n` +
          `• **Recent Note**: ${checkIn ? checkIn.notes : 'No recent check-in submitted.'}\n\n` +
          `**Proposed Action (Draft)**:\n` +
          `Send re-engagement check-in prompt: *"Hi ${client.name.split(' ')[0]}, missed your check-in last week! How is your energy and training coming along?"*`,
        draft: {
          id: `draft_${Date.now()}`,
          title: `Re-engagement Outreach for ${client.name}`,
          clientId: client.id,
          type: 'message',
          content: `Hi ${client.name.split(' ')[0]}, missed your check-in last week! How is your energy and training coming along?`,
          approved: false
        }
      };
    }

    if (prompt.toLowerCase().includes('program') || prompt.toLowerCase().includes('adjust')) {
      return {
        success: true,
        agentName: 'Trainer Copilot',
        content: `**Program Progression Analysis for ${client.name}**\n\n` +
          `• **Observed Volume**: Marcus completed all 4 sets of Barbell Back Squats at 85kg with RPE 8.\n` +
          `• **Recommended Adjustment**: Increase squat working load to 87.5kg (+2.5kg) for Next Session B.\n\n` +
          `*(Requires trainer approval to apply to active program)*`,
        draft: {
          id: `draft_prog_${Date.now()}`,
          title: `Progressive Overload +2.5kg Squat for ${client.name}`,
          clientId: client.id,
          type: 'program_update',
          approved: false
        }
      };
    }

    return {
      success: true,
      agentName: 'Trainer Copilot',
      content: `Trainer Copilot ready. Select a client to summarize check-ins, prepare session drafts, or analyze training compliance.`
    };
  }
}
