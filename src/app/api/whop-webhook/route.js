// app/api/webhooks/route.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { whopsdk } from "@/lib/whop";

export async function POST(request) {
  try {
    const requestBodyText = await request.text();
    const headers = Object.fromEntries(request.headers);
    const webhookData = whopsdk.webhooks.unwrap(requestBodyText, { headers });

    if (webhookData.type === "payment.succeeded") {
      const payment = webhookData.data;
      const metadata = payment.metadata;
      const userId = metadata?.user_id;
      const purchasedPlan = metadata?.purchased_plan;

      if (typeof userId === "string" && typeof purchasedPlan === "string") {
        const { data: userData, error: userError } =
          await supabaseAdmin.auth.admin.getUserById(userId);

        if (userError) {
          console.error("Error fetching user during webhook:", userError);
        } else {
          const currentMetadata = userData.user?.user_metadata ?? {};
          const { error: updateError } =
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              user_metadata: {
                ...currentMetadata,
                plan: purchasedPlan,
              },
            });

          if (updateError) {
            console.error("Error updating purchased plan:", updateError);
          }
        }
      } else {
        console.error("Missing plan metadata for payment succeeded:", metadata);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response("OK", { status: 200 });
  }
}
