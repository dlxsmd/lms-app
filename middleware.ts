import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    console.log("🔍 Middleware: Starting authentication check");
    console.log("📍 Request path:", request.nextUrl.pathname);

    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });

    // セッションの取得を試みる
    console.log("🔑 Middleware: Fetching session...");
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    console.log(
      "📊 Middleware: Session status:",
      session ? "Found" : "Not found"
    );

    if (error) {
      console.error("❌ Middleware: Session error:", error);
    }

    // サインアップページへのアクセスは常に許可
    if (request.nextUrl.pathname === "/auth?registered=false") {
      return res;
    }

    // 保護されたルートへのアクセスをチェック
    if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
      console.log(
        "⚠️ Middleware: Unauthorized access to dashboard, redirecting to login"
      );
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth?registered=true";
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);

      return NextResponse.redirect(redirectUrl);
    }

    // ログイン済みユーザーがログインページにアクセスした場合
    if (session && request.nextUrl.pathname === "/auth?registered=true") {
      console.log(
        "ℹ️ Middleware: Logged-in user accessing auth pages, redirecting to dashboard"
      );
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    console.log("✅ Middleware: Authentication check completed");
    return res;
  } catch (error) {
    console.error("❌ Middleware: Unexpected error:", error);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth?registered=true";
    return NextResponse.redirect(redirectUrl);
  }
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
