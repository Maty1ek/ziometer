// lib/plans.js
export const PLANS = {
  starter: {
    id: process.env.WHOP_STARTER_PRODUCT_ID, // Renamed for clarity (was PRODUCT_ID)
    price: '$4.99',
    tokens: 5,
    desc: 'Perfect for your first analysis',
  },
  explorer: {
    id: process.env.WHOP_EXPLORER_PRODUCT_ID,
    price: '$9.99',
    tokens: 15,
    desc: 'Save 25% – most popular',
  },
  'deep-dive': {
    id: process.env.WHOP_DEEP_DIVE_PRODUCT_ID,
    price: '$16.99',
    tokens: 30,
    desc: 'Best value – never run out',
  },
  test: {
    id: process.env.WHOP_TEST_PRODUCT_ID,
    price: '$10',
    tokens: 50,
    desc: 'test plan',
  },
};