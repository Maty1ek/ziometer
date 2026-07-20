// lib/plans.js
// Three one-time unlock plans (no subscriptions). Order matters — the modal
// renders them top-to-bottom and defaults to the one flagged `default`.
//
// `gnPlan` is the value the Whop webhook writes to app_metadata.plan.
// `queryLimit` (null = unlimited) seeds app_metadata.uses_remaining.
export const PLANS = {
  one_use: {
    id: process.env.WHOP_ONE_USE_PRODUCT_ID,
    name: "1 Use",
    price: "$2.99",
    period: "one-time",
    gnPlan: "one_use",
    queryLimit: 1,
    desc: ["1 full unlock", "Both tools included", "Full breakdown & sources"],
  },
  three_uses: {
    id: process.env.WHOP_THREE_USES_PRODUCT_ID,
    name: "3 Uses",
    price: "$3.99",
    period: "one-time",
    gnPlan: "three_uses",
    queryLimit: 3,
    desc: ["3 full unlocks", "Both tools included", "Full breakdown & sources"],
  },
  unlimited: {
    id: process.env.WHOP_UNLIMITED_PRODUCT_ID,
    name: "Unlimited",
    price: "$9.99",
    period: "one-time",
    best: true,
    default: true,
    gnPlan: "unlimited",
    queryLimit: null,
    desc: ["Everything in 3 Uses", "Unlimited uses, forever"],
  },
};
