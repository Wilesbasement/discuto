export function getSupabaseEnv(){return{url:process.env.NEXT_PUBLIC_SUPABASE_URL || "", anonKey:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}}
export function isSupabaseConfigured(){const e=getSupabaseEnv();return Boolean(e.url && e.anonKey && !e.anonKey.includes("PASTE_"))}
