// Role-Based Access Controller for Hermes Connect Next

import { store } from './store.js';

export class AuthController {
  static getCurrentRole() {
    const user = store.getActiveUser();
    return user ? user.role : 'client';
  }

  static canManageWorkspace() {
    const role = this.getCurrentRole();
    return role === 'owner' || role === 'admin';
  }

  static canReviewClients() {
    const role = this.getCurrentRole();
    return role === 'owner' || role === 'admin' || role === 'trainer';
  }

  static canModifyProgram() {
    const role = this.getCurrentRole();
    return role === 'owner' || role === 'admin' || role === 'trainer';
  }

  static canViewClientData(clientId) {
    const user = store.getActiveUser();
    if (!user) return false;
    if (user.role === 'owner' || user.role === 'admin' || user.role === 'trainer') return true;
    // Client can only view their own record
    const client = store.getState().clients.find(c => c.id === clientId);
    return client && client.userId === user.id;
  }
}
