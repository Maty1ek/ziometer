export const PENDING_PLAN_STORAGE_KEY = "ziometer_pending_plan";

export function normalizeUsername(username = "") {
  return username.trim().toLowerCase();
}

export function isValidUsername(username = "") {
  return /^[a-z0-9](?:[a-z0-9._-]{2,29})$/.test(normalizeUsername(username));
}

export function usernameToEmail(username = "") {
  return `${normalizeUsername(username)}@accounts.ziometer.app`;
}

export function isPaidPlan(plan = "") {
  return plan === "plan_cheap" || plan === "plan_expensive";
}

export function hasFullBreakdownAccess(plan = "") {
  return plan === "plan_expensive";
}

export function getPlanDisplayName(plan = "") {
  if (plan === "plan_cheap") {
    return "Starter";
  }

  if (plan === "plan_expensive") {
    return "Explorer";
  }

  return "Free";
}
