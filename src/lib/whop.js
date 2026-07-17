// lib/whop-sdk.ts
import Whop from "@whop/sdk";

// The Standard Webhooks verifier inside the SDK base64-DECODES this key before
// using it as the HMAC key, while Whop signs with the raw `ws_...` string. So it
// must be handed over base64-encoded — passing the secret verbatim makes the
// decoder throw on the "_" and every webhook gets rejected as an invalid
// signature. See https://docs.whop.com/developer/guides/webhooks
export const whopsdk = new Whop({
  apiKey: process.env.WHOP_API_KEY,
  webhookKey: btoa(process.env.WHOP_WEBHOOK_SECRET || ""),
});
