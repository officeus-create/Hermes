// Reactive State Engine with In-Memory & LocalStorage Persistence

import {
  demoWorkspace,
  demoUsers,
  demoClients,
  demoExercises,
  demoPrograms,
  demoCheckIns,
  demoTasks,
  demoScienceKnowledge
} from '../verticals/trainer/demoData.js';

class StateStore {
  constructor() {
    this.listeners = [];
    this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem('hermes_connect_state');
      if (saved) {
        this.state = JSON.parse(saved);
        return;
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, using initial demo state');
    }

    // Default Seed State
    this.state = {
      activeUserId: 'user_alex_morgan',
      workspace: demoWorkspace,
      users: [...demoUsers],
      clients: [...demoClients],
      exercises: [...demoExercises],
      programs: [...demoPrograms],
      checkIns: [...demoCheckIns],
      tasks: [...demoTasks],
      scienceKnowledge: [...demoScienceKnowledge],
      aiDrafts: [],
      auditLogs: []
    };
  }

  saveState() {
    try {
      localStorage.setItem('hermes_connect_state', JSON.stringify(this.state));
    } catch (e) {
      // Ignore in non-browser environments
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Getters
  getState() {
    return this.state;
  }

  getActiveUser() {
    return this.state.users.find(u => u.id === this.state.activeUserId) || this.state.users[0];
  }

  setActiveUser(userId) {
    this.state.activeUserId = userId;
    this.saveState();
  }

  // Client Mutations
  updateClientStatus(clientId, status) {
    const client = this.state.clients.find(c => c.id === clientId);
    if (client) {
      client.status = status;
      this.logAudit('update_client_status', 'Client', clientId, `Status changed to ${status}`);
      this.saveState();
    }
  }

  // Check-in Review Mutation
  reviewCheckIn(checkInId, feedback) {
    const checkIn = this.state.checkIns.find(c => c.id === checkInId);
    if (checkIn) {
      checkIn.trainerReviewed = true;
      checkIn.trainerFeedback = feedback;
      const client = this.state.clients.find(c => c.id === checkIn.clientId);
      if (client && client.status === 'at_risk') {
        client.status = 'active';
      }
      this.logAudit('review_checkin', 'CheckInRecord', checkInId, `Reviewed checkin with feedback`);
      this.saveState();
    }
  }

  // Task Mutations
  toggleTaskCompletion(taskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task) {
      task.isCompleted = !task.isCompleted;
      this.saveState();
    }
  }

  // AI Draft Mutations
  saveAiDraft(draft) {
    this.state.aiDrafts.unshift(draft);
    this.saveState();
  }

  approveAiDraft(draftId) {
    const draft = this.state.aiDrafts.find(d => d.id === draftId);
    if (draft) {
      draft.approved = true;
      this.logAudit('approve_ai_draft', 'AIDraft', draftId, `Approved draft: ${draft.title}`);
      this.saveState();
    }
  }

  logAudit(action, entityType, entityId, details) {
    this.state.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      workspaceId: this.state.workspace.id,
      actorUserId: this.state.activeUserId,
      action,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      details
    });
  }
}

export const store = new StateStore();
