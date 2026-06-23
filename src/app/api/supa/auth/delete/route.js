import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // admin.deleteUser requires the service-role key, so use the admin client.
    // The user is identified from their own verified session above.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error("Supabase admin delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 }
      );
    }

    await supabase.auth.signOut();

    // Return success - client will handle redirect and state clear
    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Unexpected error during account deletion:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
