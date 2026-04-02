// lib/plans.js
export const PLANS = {
  starter: {
    id: process.env.WHOP_STARTER_PRODUCT_ID, // Renamed for clarity (was PRODUCT_ID)
    price: '$4.99',
    title: 'ACCURACY MONSTER',
    supabasePlan: "plan_cheap",
    desc: ['Unlimited usage', 'Higher accuracy'],
  },
  explorer: {
    id: process.env.WHOP_EXPLORER_PRODUCT_ID,
    price: '$7.99',
    title: "Freedom to GOYIM",
    supabasePlan: "plan_expensive",
    desc: ['Unlimited usage', 'Higher accuracy', 'Full research & breakdown'],

  }
};
