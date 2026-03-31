import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: "Tokens are no longer used. Access is controlled by plan.",
  });
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
