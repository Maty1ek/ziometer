// app/api/whop-webhook/route.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient as createWhopClient } from '@whop-sdk/server';

const whopSdk = createWhopClient({
  apiKey: process.env.WHOP_API_KEY,
});

export async function POST(req) {
  const body = await req.text(); // Raw body for signature verification
  const signature = req.headers.get('x-whop-signature');

  // Verify webhook signature
  const isValid = whopSdk.webhooks.verifyWebhookSignature({
    body,
    signature,
    secret: process.env.WHOP_WEBHOOK_SECRET, // Set this in env (from Whop dashboard)
  });

  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.type === 'payment.succeeded') {
    const { metadata } = event.data;
    const userId = metadata.user_id;
    const tokensToAdd = parseInt(metadata.tokens, 10);

    if (!userId || isNaN(tokensToAdd) || tokensToAdd <= 0) {
      console.error('Invalid metadata:', metadata);
      return new Response(JSON.stringify({ error: 'Invalid metadata' }), { status: 400 });
    }

    // Fetch current profile
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('tokens')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.error('Fetch profile error:', fetchError);
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 500 });
    }

    // Update tokens
    const newTokens = (profile.tokens || 0) + tokensToAdd;
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ tokens: newTokens })
      .eq('id', userId);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ error: 'Update failed' }), { status: 500 });
    }

    console.log(`Added ${tokensToAdd} tokens to user ${userId}. New balance: ${newTokens}`);
  }

  // Acknowledge webhook (Whop retries on non-2xx)
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}