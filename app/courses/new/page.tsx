import NewCourseForm from "./NewCourseForm";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Database } from "@/types/database.types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewCoursePage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">新規コース作成</h1>
        <NewCourseForm userId={session.user.id} />
      </div>
    </div>
  );
}
