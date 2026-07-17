// app/api/webhooks/route.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { whopsdk } from "@/lib/whop";
import { PLANS } from "@/lib/plans";

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

        // Seed the usage counter for the limited plan; unlimited plans get null
        // (no counter). PLANS[key].queryLimit is 3 for three_uses, null otherwise.
        const usesRemaining = PLANS[purchasedPlan]?.queryLimit ?? null;

        // Entitlement is stored in app_metadata, which is writable ONLY through
        // the service-role admin API — never from the browser. This is what makes
        // the plan un-forgeable by a logged-in user.
        const { error: updateError } =
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            app_metadata: {
              ...currentAppMetadata,
              plan: purchasedPlan,
              uses_remaining: usesRemaining,
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
