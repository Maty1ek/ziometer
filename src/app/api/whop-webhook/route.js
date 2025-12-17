// app/api/webhooks/route.ts
import { createClient } from "@/lib/supabase/server";
import { whopsdk } from "@/lib/whop";

// export async function POST(request) {
//   const supabaseAdmin = createClient()
//   try {
//     // For testing: Parse body as JSON instead of using Whop unwrap (bypasses verification)
//     const webhookData = await request.json();
//     console.log(webhookData, 'loi');
    

//     if (webhookData.type === "payment.succeeded") {
//       const payment = webhookData.data;
//       const metadata = payment.metadata;

//       if (metadata && metadata.user_id && metadata.tokens) {
//         const userId = metadata.user_id; // Assume string UUID
//         const tokens = parseInt(metadata.tokens, 10);

//         // Validate: Skip if invalid (prevents crashes or bad data)
//         if (typeof userId === 'string' && !isNaN(tokens) && tokens > 0) {
//           const { error } = await supabaseAdmin.rpc('add_tokens', {
//             p_user_id: userId,
//             p_tokens: tokens,
//           });

//           if (error) {
//             console.error('Error adding tokens:', error);
//             // TODO: Add to error queue in Supabase for retries
//           } // No else needed here—success is silent (log if verbose needed)
//         } else {
//           console.error('Invalid userId or tokens in metadata:', metadata);
//         }
//       } else {
//         console.error('Missing or invalid metadata for payment succeeded');
//       }
//     }

//     // Always acknowledge webhook to prevent retries
//     return new Response('OK', { status: 200 });
//   } catch (err) {
//     console.error('Webhook processing error:', err);
//     // Still return 200 to avoid endless retries; handle errors internally
//     return new Response('OK', { status: 200 });
//   }
// }


export async function POST(request) {
  const supabaseAdmin = createClient()

  try {
    const requestBodyText = await request.text();
    const headers = Object.fromEntries(request.headers);

    // Unwrap webhook (assumes SDK is configured with webhook secret for verification)
    const webhookData = whopsdk.webhooks.unwrap(requestBodyText, { headers });
(webhookData, 'inCase');


    if (webhookData.type === "payment.succeeded") {
      const payment = webhookData.data;
      const metadata = payment.metadata;


      if (metadata && metadata.user_id && metadata.tokens) {
        const userId = metadata.user_id; // Assume string UUID
        const tokens = parseInt(metadata.tokens, 10);


        // Validate: Skip if invalid (prevents crashes or bad data)
        if (typeof userId === 'string' && !isNaN(tokens) && tokens > 0) {
          const { error } = await supabaseAdmin.rpc('add_tokens', {
            p_user_id: userId,
            p_tokens: tokens,
          });

          if (error) {
            console.error('Error adding tokens:', error);
            // TODO: Add to error queue in Supabase for retries
          } // No else needed here—success is silent (log if verbose needed)
        } else {
          console.error('Invalid userId or tokens in metadata:', metadata);
        }
      } else {
        console.error('Missing or invalid metadata for payment succeeded');
      }
    }

    // Always acknowledge webhook to prevent retries
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook processing error:', err);
    // Still return 200 to avoid endless retries; handle errors internally
    return new Response('OK', { status: 200 });
  }
}
