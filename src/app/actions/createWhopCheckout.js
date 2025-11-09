// app/actions/createWhopCheckout.js
'use server';

const PRODUCT_MAP = {
  starter: process.env.WHOP_STARTER_PRODUCT_ID,
  explorer: process.env.WHOP_EXPLORER_PRODUCT_ID,
  "deep-dive": process.env.WHOP_DEEP_DIVE_PRODUCT_ID,
};

export async function createWhopCheckout(plan, price, userEmail) {
  const productId = PRODUCT_MAP[plan];
  console.log(productId, 'idd');
  
  if (!productId) throw new Error('Invalid plan');

  const tokens = plan === 'starter' ? 5 : plan === 'explorer' ? 15 : 30;
  console.log(tokens);

  console.log(plan, 'plann');
  
  

  const body = {
    plan_id: productId,
    plan_type: 'one_time',
    metadata: {
      tokens: tokens.toString(),
      user_email: userEmail,
    },
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000',
  };

  console.log(body, 'hwop');
  

//   console.log('Whop body:', body); // Debug

  const res = await fetch('https://api.whop.com/api/v2/checkout_sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

    const json = await res.json();
  console.log(json, 'rews');
  

  if (!res.ok) {
    console.error('Whop full response:', json);
    throw new Error(`Whop error: ${json.error?.message || JSON.stringify(json.error)}`);
  }

  return json.purchase_url;
}