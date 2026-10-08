import { DurableObject } from "cloudflare:workers";
import leadEmailWorker, { CarHaulingDeliveryCoordinatorCore } from "./index.mjs";
import { ColdFairActionLedgerCore } from "./cold-fair-action-ledger.mjs";
import { handleLoadBoardInboundEmail } from "./load-board-inbound.mjs";

export class CarHaulingDeliveryCoordinator extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.coordinator = new CarHaulingDeliveryCoordinatorCore(ctx, env);
  }

  fetch(request) {
    return this.coordinator.fetch(request);
  }

  alarm() {
    return this.coordinator.alarm();
  }
}

export class ColdFairActionLedger extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ledger = new ColdFairActionLedgerCore(ctx);
  }

  fetch(request) {
    return this.ledger.fetch(request);
  }
}

export default {
  fetch(request, env, ctx) {
    return leadEmailWorker.fetch(request, env, ctx);
  },

  async email(message, env, ctx) {
    return handleLoadBoardInboundEmail(message, env, ctx);
  },
};
