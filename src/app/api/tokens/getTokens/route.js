// app/api/tokens/route.js

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';


export async function GET(request) {
    const supabaseAdmin = await createClient()

  const { data: {session}, error: authError } = await supabaseAdmin.auth.getSession();

  const user = session.user

  // console.log(session, authError,'lolipop');
  

  if (authError || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('user_tokens')
    .select('tokens')
    .eq('user_id', session.user.id)
    .single();

    console.log(data, data.tokens,'get01');
    

  if (error) {
    console.error('Token fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }

  return NextResponse.json({ tokens: data?.tokens ?? 0 });
}