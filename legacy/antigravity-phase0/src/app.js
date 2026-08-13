// Main Application Entry Point & Controller

import { store } from './core/store.js';
import { renderTrainerDashboard, renderClientDashboard } from './ui/components.js';
import { HermesAIRouter } from './ai/router.js';

class AppController {
  constructor() {
    this.selectedAgent = 'trainer_copilot';
    this.initGlobalHandlers();
  }

  init() {
    store.subscribe(state => this.render(state));
    this.render(store.getState());
  }

  render(state) {
    const mainContainer = document.getElementById('app-main');
    const aiDrawerContainer = document.getElementById('app-ai-drawer');
    const activeUser = store.getActiveUser();

    if (mainContainer) {
      if (activeUser.role === 'trainer' || activeUser.role === 'owner') {
        mainContainer.innerHTML = renderTrainerDashboard(state);
      } else {
        mainContainer.innerHTML = renderClientDashboard(state);
      }
    }

    if (aiDrawerContainer) {
      aiDrawerContainer.innerHTML = this.renderAIDrawer(state);
    }
  }

  renderAIDrawer(state) {
    return `
      <div class="ai-drawer">
        <div class="ai-header">
          <div class="ai-icon">🤖</div>
          <div>
            <div style="font-weight: 700; font-family: var(--font-heading);">Hermes AI Router</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Specialized Agent Copilots</div>
          </div>
        </div>

        <!-- Agent Selection Tabs -->
        <div style="display: flex; gap: 0.25rem; margin-bottom: 1rem; background: var(--bg-primary); padding: 0.25rem; border-radius: 6px;">
          <button class="btn-role ${this.selectedAgent === 'trainer_copilot' ? 'active' : ''}" onclick="window.setAgent('trainer_copilot')">Trainer Copilot</button>
          <button class="btn-role ${this.selectedAgent === 'science_agent' ? 'active' : ''}" onclick="window.setAgent('science_agent')">Science Agent</button>
          <button class="btn-role ${this.selectedAgent === 'client_assistant' ? 'active' : ''}" onclick="window.setAgent('client_assistant')">Client Assistant</button>
        </div>

        <div class="chat-box" id="ai-chat-box">
          <div style="color: var(--text-secondary); line-height: 1.4;">
            👋 Active Agent: <strong>${this.selectedAgent.replace('_', ' ').toUpperCase()}</strong><br>
            Ask a question, request a client check-in summary, or search science evidence.
          </div>
        </div>

        <div class="chat-input-group">
          <input type="text" id="ai-prompt-input" class="input-text" placeholder="Ask AI assistant..." onkeypress="if(event.key==='Enter') window.sendAiPrompt()">
          <button class="btn-action" onclick="window.sendAiPrompt()">Send</button>
        </div>
      </div>
    `;
  }

  initGlobalHandlers() {
    window.switchRole = (role) => {
      const user = store.getState().users.find(u => u.role === role) || store.getState().users[0];
      store.setActiveUser(user.id);
    };

    window.setAgent = (agentType) => {
      this.selectedAgent = agentType;
      this.render(store.getState());
    };

    window.sendAiPrompt = async () => {
      const input = document.getElementById('ai-prompt-input');
      const chatBox = document.getElementById('ai-chat-box');
      if (!input || !input.value.trim()) return;

      const promptText = input.value.trim();
      input.value = '';

      chatBox.innerHTML += `<div style="margin-top: 0.75rem; text-align: right; color: var(--accent-primary); font-weight: 600;">You: ${promptText}</div>`;
      chatBox.scrollTop = chatBox.scrollHeight;

      const result = await HermesAIRouter.route(this.selectedAgent, promptText);

      const htmlContent = typeof result.content === 'string' ? result.content.replace(/\n/g, '<br>') : result.content;
      chatBox.innerHTML += `
        <div style="margin-top: 0.75rem; background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color);">
          <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${result.agentName || 'Hermes AI'}</div>
          <div style="margin-top: 0.25rem;">${htmlContent}</div>
          ${result.draft ? `
            <div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(99,102,241,0.15); border-radius: 6px; border: 1px dashed var(--accent-primary);">
              <div style="font-size: 0.8rem; font-weight: 600; color: var(--accent-primary);">Draft Generated</div>
              <button class="btn-action" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; margin-top: 0.25rem;" onclick="window.approveDraft('${result.draft.id}')">Approve & Apply Draft</button>
            </div>
          ` : ''}
        </div>
      `;
      chatBox.scrollTop = chatBox.scrollHeight;
    };

    window.reviewClient = (clientId) => {
      const client = store.getState().clients.find(c => c.id === clientId);
      if (client) {
        alert(`Reviewing Client: ${client.name}\nGoal: ${client.primaryGoal}\nStatus: ${client.status}`);
      }
    };

    window.toggleTask = (taskId) => {
      store.toggleTaskCompletion(taskId);
    };

    window.startWorkout = () => {
      alert('Starting Session B Workout Logger! Complete sets and reps to update progress.');
    };
  }
}

export const app = new AppController();
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => app.init());
}
