import { Inter } from "next/font/google";
import "./globals.css";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Navbar from "@/components/Layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata = {
  title: "学習管理システム",
  description:
    "教師がコンテンツを作成・管理し、学生が学習できるプラットフォーム",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return (
      <html lang="ja">
        <body className={inter.className}>
          <Navbar />
          <div className="pt-16">{children}</div>
        </body>
      </html>
    );
  } catch (error) {
    console.error("Layout error:", error);
    return (
      <html lang="ja">
        <body className={inter.className}>
          <Navbar />
          <div className="pt-16">{children}</div>
        </body>
      </html>
    );
  }
}
