import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";
export function createClient(){const {url,anonKey}=getSupabaseEnv(); if(!isSupabaseConfigured()) return null; return createBrowserClient(url,anonKey)}
