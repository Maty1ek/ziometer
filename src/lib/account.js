export const PENDING_PLAN_STORAGE_KEY = "ziometer_pending_plan";

// Set only when a user clicks "Continue with Google" while a plan is selected.
// After the OAuth redirect returns, the page reads this to resume checkout.
// Kept separate from PENDING_PLAN_STORAGE_KEY so it can't misfire on normal loads.
export const OAUTH_CHECKOUT_PLAN_KEY = "ziometer_oauth_checkout_plan";

export function normalizeUsername(username = "") {
  return username.trim().toLowerCase();
}

export function isValidUsername(username = "") {
  return /^[a-z0-9](?:[a-z0-9._-]{2,29})$/.test(normalizeUsername(username));
}

export function usernameToEmail(username = "") {
  return `${normalizeUsername(username)}@accounts.ziometer.app`;
}

// ── Plan model ────────────────────────────────────────────────────────────
// The single source of truth for entitlement is `app_metadata.plan`, set by the
// Whop webhook via the service-role admin API (app_metadata is not writable from
// the browser, so the plan can't be forged). Three one-time plans, no subs:
//   three_uses         — 3 unlocks (tracked in app_metadata.uses_remaining)
//   unlimited          — unlimited unlocks
//   unlimited_support  — unlimited unlocks, buyer paid extra to support

export function isPaidPlan(plan = "") {
  return plan === "three_uses" || plan === "unlimited" || plan === "unlimited_support";
}

// A limited plan burns a per-use counter; unlimited plans don't.
export function isLimitedPlan(plan = "") {
  return plan === "three_uses";
}

export function isUnlimitedPlan(plan = "") {
  return plan === "unlimited" || plan === "unlimited_support";
}

// Every paid plan unlocks the full breakdown, deep research, and sources.
export function hasFullBreakdownAccess(plan = "") {
  return isPaidPlan(plan);
}

export function getPlanDisplayName(plan = "") {
  if (plan === "three_uses") return "3 Uses";
  if (plan === "unlimited") return "Unlimited";
  if (plan === "unlimited_support") return "Supporter";
  return "Free";
}
