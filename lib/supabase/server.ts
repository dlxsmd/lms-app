import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {  // asyncを削除
          return cookieStore.getAll();  // awaitを削除
        },
        setAll(cookiesToSet) {  // asyncを削除
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ミドルウェアでセッション更新している場合は無視
          }
        },
      },
    }
  );
}
