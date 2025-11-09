// // app/api/getTokens/route.js
// import { getUserTokens } from '@/lib/supabaseServer';

// export async function POST(req) {
//   const { userId } = await req.json();
//   const tokens = await getUserTokens(userId);
//   return Response.json({ tokens });
// }