// Server-side entitlement + usage. The ONLY place that decides whether a paid
// action may run and that burns a use. Both AI tools call consumePaidUse so the
// backend has one gate. Plan + counter live in app_metadata (set by the Whop
// webhook) — writable ONLY via the service-role admin client, so a user can't
// grant themselves a plan from the browser.

import { supabaseAdmin } from "@/lib/supabase/admin";
import { isPaidPlan, isLimitedPlan } from "@/lib/account";

// Atomically-ish check + decrement one paid use.
// Returns { allowed, plan, remaining }. `remaining` is null for unlimited plans.
//
// Note: getUserById + updateUserById isn't a true transaction, but a single user
// won't realistically fire concurrent requests, so it's safe for this scale.
export async function consumePaidUse(userId) {
  if (!userId) return { allowed: false, plan: null, remaining: 0 };

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error || !data?.user) return { allowed: false, plan: null, remaining: 0 };

  const meta = data.user.app_metadata ?? {};
  const plan = meta.plan ?? null;

  if (!isPaidPlan(plan)) return { allowed: false, plan, remaining: 0 };

  // Unlimited plans: no counter to touch.
  if (!isLimitedPlan(plan)) return { allowed: true, plan, remaining: null };

  // Limited plan (three_uses): check and decrement the counter.
  const remaining = Number.isInteger(meta.uses_remaining) ? meta.uses_remaining : 0;
  if (remaining <= 0) return { allowed: false, plan, remaining: 0 };

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { ...meta, uses_remaining: remaining - 1 },
  });
  if (updateError) return { allowed: false, plan, remaining };

  return { allowed: true, plan, remaining: remaining - 1 };
}
