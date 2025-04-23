import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Database } from "../database.types";

export const createServerClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
};
