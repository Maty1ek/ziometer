import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
);


  const { userId, amount } = await req.json();

  if (!userId || !amount)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // 1. Fetch current tokens
  const { data, error } = await supabase
    .from("user_tokens")
    .select("tokens")
    .eq("user_id", userId)
    .single();

  if (error || !data)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (data.tokens < amount)
    return NextResponse.json({ error: "Not enough tokens" }, { status: 403 });

  // 2. Deduct tokens
  const { error: updateError } = await supabase
    .from("user_tokens")
    .update({ tokens: data.tokens - amount })
    .eq("user_id", userId);

  if (updateError)
    return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
