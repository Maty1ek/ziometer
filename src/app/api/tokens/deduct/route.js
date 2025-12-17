import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createClient();

  const {data: {session}} = await supabase.auth.getSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.rpc("deduct_user_token", {
    uid: session.user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}


// export async function POST(req) {
// const supabase = createClient()
// const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const userId = session.user.id;

//   // if (!userId || !amount)
//   //   return NextResponse.json({ error: "Missing fields" }, { status: 400 });

//   // 1. Fetch current tokens
//   const { data, error } = await supabase
//     .from("user_tokens")
//     .select("tokens")
//     .eq("user_id", userId)
//     .single();

//   if (error || !data)
//     return NextResponse.json({ error: "User not found" }, { status: 404 });

//   if (data.tokens < 1)
//     return NextResponse.json({ error: "Not enough tokens" }, { status: 403 });

//   // 2. Deduct tokens
//   const { error: updateError } = await supabase
//     .from("user_tokens")
//     .update({ tokens: data.tokens - 1 })
//     .eq("user_id", userId);

//   if (updateError)
//     return NextResponse.json({ error: updateError.message }, { status: 400 });

//   return NextResponse.json({ success: true });
// }
