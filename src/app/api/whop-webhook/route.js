// app/api/webhooks/route.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { whopsdk } from "@/lib/whop";
import { PLANS } from "@/lib/plans";
import { isUnlimitedPlan } from "@/lib/account";

export async function POST(request) {
  const requestBodyText = await request.text();
  const headers = Object.fromEntries(request.headers);

  // Verify the signature. A failure here means the request is not a trusted
  // Whop webhook, so reject it (4xx) rather than acknowledging it.
  let webhookData;
  try {
    webhookData = whopsdk.webhooks.unwrap(requestBodyText, { headers });
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (webhookData.type === "payment.succeeded") {
      const payment = webhookData.data;
      const metadata = payment.metadata;
      const userId = metadata?.user_id;
      const purchasedPlan = metadata?.purchased_plan;

      if (typeof userId === "string" && typeof purchasedPlan === "string") {
        const { data: userData, error: userError } =
          await supabaseAdmin.auth.admin.getUserById(userId);

        if (userError) {
          throw new Error(`Failed to fetch user ${userId}: ${userError.message}`);
        }

        const currentAppMetadata = userData.user?.app_metadata ?? {};
        const currentPlan = currentAppMetadata.plan ?? null;

        // A purchase must never take entitlement away. Two rules:
        //   1. Already unlimited → stay unlimited, whatever was just bought.
        //      (Otherwise an unlimited holder who buys a pack is downgraded to it.)
        //   2. Buying a pack while holding credits → ADD to the counter.
        //      (A flat overwrite meant buying 3 uses with 2 left left you at 3.)
        // PLANS[key].queryLimit is 1 for one_use, 3 for three_uses, null for unlimited.
        const purchasedLimit = PLANS[purchasedPlan]?.queryLimit ?? null;

        let nextPlan = purchasedPlan;
        let nextUsesRemaining;

        if (isUnlimitedPlan(currentPlan)) {
          // Rule 1: keep the stronger plan; unlimited has no counter.
          nextPlan = currentPlan;
          nextUsesRemaining = null;
        } else if (purchasedLimit === null) {
          // Upgrading to unlimited: counter no longer applies.
          nextUsesRemaining = null;
        } else {
          // Rule 2: top up whatever is left over.
          const existing = Number.isInteger(currentAppMetadata.uses_remaining)
            ? currentAppMetadata.uses_remaining
            : 0;
          nextUsesRemaining = Math.max(existing, 0) + purchasedLimit;
        }

        // Entitlement is stored in app_metadata, which is writable ONLY through
        // the service-role admin API — never from the browser. This is what makes
        // the plan un-forgeable by a logged-in user.
        const { error: updateError } =
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            app_metadata: {
              ...currentAppMetadata,
              plan: nextPlan,
              uses_remaining: nextUsesRemaining,
            },
          });

        if (updateError) {
          throw new Error(`Failed to update plan: ${updateError.message}`);
        }
      } else {
        // Nothing actionable in the metadata — acknowledge so Whop stops retrying.
        console.error("Missing plan metadata for payment succeeded:", metadata);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    // Genuine processing failure: return 5xx so Whop retries delivery.
    console.error("Webhook processing error:", err);
    return new Response("Processing error", { status: 500 });
  }
}
