// app/actions.ts
"use server";
import { whopsdk } from "@/lib/whop";
import { PLANS } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export async function createWhopCheckout(planKey) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

if (!session?.user) {
    throw new Error("Unauthorized");
  }


  const plan = PLANS[planKey];
  const checkoutConfig = await whopsdk.checkoutConfigurations.create({
    plan_id: plan.id,
    redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/?payment=success`,
    metadata: {
      user_id: session.user.id,
      tokens: plan.tokens.toString(),
    },
  });

  return checkoutConfig.purchase_url; // URL to redirect user to
  // return null
}
