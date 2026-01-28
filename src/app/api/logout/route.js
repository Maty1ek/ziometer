import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Server logout error:", error);
      return new Response(JSON.stringify({ error: "Failed to log out" }), {
        status: 500,
      });
    }
    // Return success - client will handle redirect and state clear
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Unexpected server logout error:", err);
    return new Response(JSON.stringify({ error: "Logout failed" }), {
      status: 500,
    });
  }
}
