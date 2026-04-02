// app/actions.ts
"use server";
import { whopsdk } from "@/lib/whop";
import { PLANS } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export async function createWhopCheckout(planKey) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const plan = PLANS[planKey];
  if (!plan) {
    throw new Error("Invalid plan selected");
  }

  const checkoutConfig = await whopsdk.checkoutConfigurations.create({
    plan_id: plan.id,
    redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/?payment=success`,
    metadata: {
      user_id: user.id,
      plan_key: planKey,
      purchased_plan: plan.supabasePlan,
    },
  });

  return checkoutConfig.purchase_url; // URL to redirect user to
  // return null
}
