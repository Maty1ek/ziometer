import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log(user.id, 'userid');
    const { error: cleanupError } = await supabase
      .from('user_tokens') // replace with your actual table name
      .delete()
      .eq('user_id', user.id);

    if (cleanupError) {
      console.error('Cleanup error:', cleanupError);
  console.log(cleanupError, 'errorlol');

      // Decide if you want to fail the whole deletion or continue
    }
    
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
  console.log(deleteError, 'errorlol2');


    if (deleteError) {
      console.error('Supabase admin delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }
    await supabase.auth.signOut();
    // Return success - client will handle redirect and state clear
    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Unexpected error during account deletion:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
