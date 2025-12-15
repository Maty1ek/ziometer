// app/actions.ts
"use server";
import { whopsdk } from "@/lib/whop";
import { PLANS } from "@/lib/plans";

export async function createWhopCheckout(planKey, userId) {
  const plan = PLANS[planKey];
  const checkoutConfig = await whopsdk.checkoutConfigurations.create({
    plan_id: plan.id,
    redirect_url: "https://victoria-fleeting-textually.ngrok-free.dev/?payment=success",
    metadata: {
      user_id: userId,
      tokens: plan.tokens.toString(),
    },
  });

  return checkoutConfig.purchase_url; // URL to redirect user to
  // return null
}
