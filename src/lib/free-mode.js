// Client-safe test flag. Kept in its own module (no server-only imports) so it
// can be read from client components without pulling in the service-role
// Supabase admin client. When true, the paywall is disabled everywhere.
export const FREE_MODE = process.env.NEXT_PUBLIC_FREE_MODE === "true";
