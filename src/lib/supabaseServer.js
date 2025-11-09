// lib/supabaseServer.js
import { createClient } from '@supabase/supabase-js';

// ---- DEBUG: make sure the env vars are really there ----
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL missing in .env.local');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY missing in .env.local');
}

// ---- Create the server client (service_role bypasses RLS) ----
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/* ---------- Helper functions ---------- */
export async function getUserTokens(userId) {
  const { data, error } = await supabase
    .from('user_tokens')
    .select('tokens')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('getUserTokens error:', error);
    return 0;
  }
  return data?.tokens ?? 0;
}

export async function addTokens(userId, amount) {
  const { error } = await supabase.rpc('increment_tokens', {
    uid: userId,
    inc: amount,
  });
  if (error) console.error('addTokens error:', error);
}