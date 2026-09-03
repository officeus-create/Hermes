import { createHermesConnectSocialCardPng } from "../../lib/hermes-connect-social-card";

export const prerender = true;

export function GET() {
  const png = createHermesConnectSocialCardPng();
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
