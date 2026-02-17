import { createClient } from "@supabase/supabase-js";


const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient<any>> | undefined;
};

export const supabase =
  globalForSupabase.supabase ??
  createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );


globalForSupabase.supabase = supabase;

