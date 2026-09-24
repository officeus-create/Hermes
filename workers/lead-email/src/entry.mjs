import leadEmailWorker, { CarHaulingDeliveryCoordinatorCore } from "./index.mjs";
import { handleLoadBoardInboundEmail } from "./load-board-inbound.mjs";

export class CarHaulingDeliveryCoordinator {
  constructor(ctx, env) {
    this.coordinator = new CarHaulingDeliveryCoordinatorCore(ctx, env);
  }

  fetch(request) {
    return this.coordinator.fetch(request);
  }

  alarm() {
    return this.coordinator.alarm();
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
