// // app/actions/createWhopCheckout.js
// 'use server';

// const PRODUCT_MAP = {
//   starter: process.env.WHOP_STARTER_PRODUCT_ID,
//   explorer: process.env.WHOP_EXPLORER_PRODUCT_ID,
//   "deep-dive": process.env.WHOP_DEEP_DIVE_PRODUCT_ID,
//   test: process.env.WHOP_TEST_PRODUCT_ID
// };

// export async function createWhopCheckout(plan, price, userEmail) {
//   const productId = PRODUCT_MAP[plan];
//   console.log(productId, 'idd');
  
//   if (!productId) throw new Error('Invalid plan');

//   const tokens = plan === 'starter' ? 5 : plan === 'explorer' ? 15 : 30;
//   console.log(tokens);

//   console.log(plan, 'plann');
  
  

//   const body = {
//     plan_id: productId,
//     plan_type: 'one_time',
//     metadata: {
//       tokens: tokens.toString(),
//       user_email: userEmail,
//     },
//     redirect_url: 'http://localhost:3000/success',
//     cancel_url: 'http://localhost:3000',
//   };

//   console.log(body, 'hwop');
  

// //   console.log('Whop body:', body); // Debug

//   const res = await fetch('https://api.whop.com/api/v2/checkout_sessions', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(body),
//   });

//     const json = await res.json();
//   console.log(json, 'rews');
  

//   if (!res.ok) {
//     console.error('Whop full response:', json);
//     throw new Error(`Whop error: ${json.error?.message || JSON.stringify(json.error)}`);
//   }

//   return json.purchase_url;
// }

// app/actions/createWhopCheckout.js
// 'use server';
// import { createClient as createWhopClient } from '@whop/sdk';
// import { PLANS } from '@/lib/plans';

// export async function createWhopCheckout(plan, userId) { // Changed to userId
//   const planConfig = PLANS[plan];
//   if (!planConfig) throw new Error('Invalid plan');

//   const whopSdk = createWhopClient({
//     apiKey: process.env.WHOP_API_KEY,
//   });

//   const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

//   try {
//     const result = await whopSdk.payments.createCheckoutSession({
//       planId: planConfig.id,
//       metadata: {
//         tokens: planConfig.tokens, // Keep as number; SDK handles
//         user_id: userId,
//       },
//       redirectUrl: `${baseUrl}/success`, // Success redirect
//     });

//     return result.purchaseUrl;
//   } catch (err) {
//     console.error('Whop SDK error:', err.message, err.stack);
//     throw new Error(`Checkout creation failed: ${err.message}`);
//   }
// }

'use server'

import { Whop } from '@whop/sdk';
import { PLANS } from '@/lib/plans';

// Initialize SDK
const whop = new Whop({ apiKey: process.env.WHOP_API_KEY });

export async function createWhopCheckout(planKey, userId) {
  console.log(planKey, userId);
  
  // 1. Lookup the Real ID safely on the server
  // Since this runs on the server, process.env works here!
  const plan = PLANS[planKey];
  console.log(plan, 'helloBBY');
  

  if (!plan || !plan.id) {
    throw new Error(`Invalid plan selected: ${planKey}`);
  }

  try {
    // 2. Create the Whop Checkout Session
    const session = await whop.checkoutConfigurations.create({
      plan_id: plan.id,
      redirect_url: 'https://victoria-fleeting-textually.ngrok-free.dev/success', // Change this to your live URL later
      metadata: {
        user_id: userId,
        plan_key: planKey // Useful for debugging later
      }
    });

    // 3. Return the URL to the client
    return session.url;

  } catch (error) {
    console.error('Whop Checkout Error:', error);
    throw new Error('Failed to create checkout session');
  }
}