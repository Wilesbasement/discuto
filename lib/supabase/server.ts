import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";
export function createClient(){ if(!isSupabaseConfigured()) return null; const cookieStore=cookies(); const {url,anonKey}=getSupabaseEnv(); return createServerClient(url,anonKey,{cookies:{get(name:string){return cookieStore.get(name)?.value},set(name:string,value:string,options:any){cookieStore.set({name,value,...options})},remove(name:string,options:any){cookieStore.set({name,value:"",...options})}}})}
