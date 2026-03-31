import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Legacy getTokens route getUser error:", error);
  }

  return NextResponse.json({
    tokens: 0,
    plan: user?.user_metadata?.plan ?? null,
  });
}
