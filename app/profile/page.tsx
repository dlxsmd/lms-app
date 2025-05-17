import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect("/login");
    }

    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (userError) {
      console.error("ユーザー情報の取得に失敗しました:", userError);
      return <div>エラーが発生しました。</div>;
    }

    return <ProfileClient user={userData} />;
  } catch (error) {
    console.error("Error:", error);
    return <div>エラーが発生しました。</div>;
  }
}