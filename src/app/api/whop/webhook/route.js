// app/api/whop/webhook/route.js
// Whop webhook handler (API route – runs server-side only). Verifies sig, credits tokens on payment.succeeded.
import crypto from 'crypto';
import { addTokens } from '@/lib/supabaseServer';

export async function POST(req) {
  const sig = req.headers.get('whop-signature');
  const raw = await req.text();

  // 1. Verify HMAC signature (prevents fakes).
  const hmac = crypto.createHmac('sha256', process.env.WHOP_WEBHOOK_SECRET);
  hmac.update(raw);
  const expected = `sha256=${hmac.digest('hex')}`;
  if (sig !== expected) {
    console.error('Invalid webhook sig');
    return new Response('Invalid sig', { status: 400 });
  }

  const payload = JSON.parse(raw);
  const { event, data } = payload;

  // 2. Handle events (V1 – only care about succeeded for credit).
  if (event === 'payment.succeeded') {
    const tokens = parseInt(data.metadata?.tokens || '0', 10);
    if (!tokens) {
      console.error('No tokens in metadata');
      return new Response('OK', { status: 200 });
    }

    const email = data.user_email?.toLowerCase();
    if (!email) {
      console.error('No email in payload');
      return new Response('OK', { status: 200 });
    }

    // 3. Find Supabase user by email.
    const { data: authUser, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('Supabase user list error:', error);
      return new Response('OK', { status: 200 });
    }

    const user = authUser.users.find(u => u.email.toLowerCase() === email);
    if (!user) {
      console.error('User not found for email:', email);
      return new Response('OK', { status: 200 });
    }

    // 4. Credit tokens.
    await addTokens(user.id, tokens);
    console.log(`Credited ${tokens} tokens to user ${user.id}`);
  } else if (event === 'payment.failed') {
    console.error('Payment failed:', data.reason);
  }

  // Always 200 to avoid Whop retries.
  return new Response('OK', { status: 200 });
}