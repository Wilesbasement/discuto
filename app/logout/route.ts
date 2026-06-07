import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function GET(){const supabase=createClient(); if(supabase) await supabase.auth.signOut(); redirect("/")}
