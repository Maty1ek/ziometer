// // Example: POST /api/create-checkout
// import { whop } from './lib/whop'; // Import your initialized SDK

// export async function POST(req, res) {
//   const { planId, userId } = req.body; 

//   try {
//     // 1. Create a Checkout Session
//     const session = await whop.checkoutSessions.create({
//       plan_id: planId,              // The plan ID from your env/frontend
//       redirect_url: 'http://localhost:3000/success', // Where they go AFTER paying
//       metadata: {
//         user_id: userId,            // CRITICAL: This links the payment to the user
//         supabase_id: userId 
//       }
//     });

//     // 2. Return the checkout URL to the frontend
//     return res.status(200).json({ url: session.url }); 

//   } catch (error) {
//     console.error('Whop Checkout Error:', error);
//     return res.status(500).json({ error: 'Failed to initiate checkout' });
//   }
// }