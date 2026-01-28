// app/api/webhooks/route.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { whopsdk } from "@/lib/whop";


let dataTT = null
export async function POST(request) {

  try {
    const requestBodyText = await request.text();
    const headers = Object.fromEntries(request.headers);

    // Unwrap webhook (assumes SDK is configured with webhook secret for verification)
    const webhookData = whopsdk.webhooks.unwrap(requestBodyText, { headers });
console.log({
  type: webhookData.type,
  id: webhookData.data.id,
  sth: webhookData.data.purchase_id,
  full: webhookData.data,
}, 'inCase');



    if (webhookData.type === "payment.succeeded") {
      const payment = webhookData.data;
      const paymentId = payment.id;    
      const metadata = payment.metadata;


      if (metadata && metadata.user_id && metadata.tokens) {
        const userId = metadata.user_id; // Assume string UUID
        const tokens = parseInt(metadata.tokens, 10);
console.log(tokens,'loli1');


        // Validate: Skip if invalid (prevents crashes or bad data)
        if (typeof userId === 'string' && !isNaN(tokens) && tokens > 0) {
          const {data, error} = await supabaseAdmin.rpc('add_tokens', {
            p_payment_id: paymentId,
            p_user_id: userId,
            p_tokens: tokens,
          });
          dataTT = data
console.log( paymentId, tokens,'loli2');


          if (error) {
            console.error('Error adding tokens:', error);
            // TODO: Add to error queue in Supabase for retries
          } // No else needed here—success is silent (log if verbose needed)
          console.log(data, 'OPOP1')
        } else {
          console.error('Invalid userId or tokens in metadata:', metadata);
        }

      } else {
        console.error('Missing or invalid metadata for payment succeeded');
      }
    }

    // Always acknowledge webhook to prevent retries
        console.log(dataTT, 'OPOP2')

    return new Response('OK', { status: 200 });
    
  } catch (err) {
    console.error('Webhook processing error:', err);
    // Still return 200 to avoid endless retries; handle errors internally
    return new Response('OK', { status: 200 });
  }
}
