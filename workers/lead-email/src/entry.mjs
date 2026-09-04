import leadEmailWorker from "./index.mjs";
import { handleLoadBoardInboundEmail } from "./load-board-inbound.mjs";

export default {
  fetch(request, env, ctx) {
    return leadEmailWorker.fetch(request, env, ctx);
  },

  async email(message, env, ctx) {
    return handleLoadBoardInboundEmail(message, env, ctx);
  },
};
