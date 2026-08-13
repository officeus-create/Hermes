// UI Component Generators for Hermes Connect Next

import { store } from '../core/store.js';
import { HermesAIRouter } from '../ai/router.js';

export function renderTrainerDashboard(state) {
  const overdueClients = state.clients.filter(c => c.status === 'at_risk');
  const newIntakeClients = state.clients.filter(c => c.status === 'new_intake');
  const activeClients = state.clients.filter(c => c.status === 'active');
  const pendingTasks = state.tasks.filter(t => !t.isCompleted);

  return `
    <div class="trainer-view">
      <div class="card" style="border-left: 4px solid var(--accent-primary);">
        <h2 class="card-title">
          <span>⚡ Trainer Command Center</span>
          <span class="badge badge-active">${state.workspace.name}</span>
        </h2>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">
          Focus Question: <strong>Who needs my attention today?</strong>
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 10px;">
            <div style="font-size: 1.8rem; font-weight: 700; color: var(--status-danger);">${overdueClients.length}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">Overdue Check-ins</div>
          </div>
          <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); padding: 1rem; border-radius: 10px;">
            <div style="font-size: 1.8rem; font-weight: 700; color: var(--status-warning);">${newIntakeClients.length}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">New Intakes to Assign</div>
          </div>
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 1rem; border-radius: 10px;">
            <div style="font-size: 1.8rem; font-weight: 700; color: var(--status-active);">${activeClients.length}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">Active Consistent Clients</div>
          </div>
        </div>
      </div>

      <!-- Action Required Client Roster -->
      <div class="card">
        <h3 class="card-title">👥 Clients Requiring Action</h3>
        <div class="client-list">
          ${state.clients.map(c => `
            <div class="client-row" onclick="window.selectClient('${c.id}')">
              <div class="client-meta">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80" class="avatar" alt="${c.name}">
                <div>
                  <div style="font-weight: 600;">${c.name}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${c.primaryGoal}</div>
                </div>
              </div>
              <div>
                <span class="badge ${c.status === 'at_risk' ? 'badge-danger' : c.status === 'new_intake' ? 'badge-warning' : 'badge-active'}">
                  ${c.status.replace('_', ' ')}
                </span>
                <button class="btn-action" style="font-size: 0.75rem; padding: 0.3rem 0.6rem; margin-left: 0.5rem;" onclick="event.stopPropagation(); window.reviewClient('${c.id}')">
                  Review
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Priority Tasks -->
      <div class="card">
        <h3 class="card-title">📋 Operational Tasks Today</h3>
        <div class="task-list">
          ${pendingTasks.map(t => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid var(--border-color);">
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" ${t.isCompleted ? 'checked' : ''} onchange="window.toggleTask('${t.id}')">
                <span style="${t.isCompleted ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${t.title}</span>
              </label>
              <span class="badge badge-info">${t.priority}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function renderClientDashboard(state) {
  const activeUser = store.getActiveUser();
  const client = state.clients.find(c => c.userId === activeUser.id) || state.clients[0];
  const program = state.programs[0];

  return `
    <div class="client-view">
      <div class="card" style="border-left: 4px solid var(--status-active);">
        <h2 class="card-title">
          <span>🎯 Today's Plan — ${client.name}</span>
          <span class="badge badge-active">Week 2 • Day 2</span>
        </h2>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">
          Focus Question: <strong>What do I do today?</strong>
        </p>

        <!-- Scheduled Workout Card -->
        <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); padding: 1.25rem; border-radius: 12px; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 1.1rem; color: #fff;">${program.sessions[1].title}</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">${program.sessions[1].exercises.length} Exercises prescribed</div>
            </div>
            <button class="btn-action" onclick="window.startWorkout()">Start Workout</button>
          </div>
        </div>

        <!-- Daily Habits Checklist -->
        <h4 style="margin: 1rem 0 0.5rem 0; font-family: var(--font-heading);">Daily Habits & Check-in</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div style="background: var(--bg-primary); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 0.8rem; color: var(--text-muted);">Water Goal</div>
            <div style="font-weight: 600;">💧 2.5 / 3.0 Liters</div>
          </div>
          <div style="background: var(--bg-primary); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 0.8rem; color: var(--text-muted);">Protein Goal</div>
            <div style="font-weight: 600;">🥩 140 / 160 Grams</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
