import { createHermesConnectSocialCardPng } from "../../lib/hermes-connect-social-card-generator";

export const prerender = true;

export function GET() {
  const body = Uint8Array.from(createHermesConnectSocialCardPng()).buffer as ArrayBuffer;
  return new Response(body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
