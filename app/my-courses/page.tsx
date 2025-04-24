import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Suspense } from "react";
import CourseList from "./CourseList";
import { Database } from "../../types/database.types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  teacher: Teacher;
  created_at: string;
}

interface Enrollment {
  id: string;
  course: Course;
  enrolled_at: string;
}

export default async function MyCoursesPage() {
  const supabase = createServerComponentClient<Database>({
    cookies,
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Authentication error:", authError);
    return <div>ログインしてください</div>;
  }

  const { data: enrollments, error } = await supabase
    .from("course_enrollments")
    .select(
      `
      id,
      enrolled_at,
      course:course_id (
        id,
        title,
        description,
        created_at,
        teacher:teacher_id (
          id,
          first_name,
          email
        )
      )
    `
    )
    .eq("student_id", user.id)
    .returns<Enrollment[]>();

  if (error) {
    console.error("Error fetching enrollments:", error);
    return <div>コースの取得中にエラーが発生しました</div>;
  }

  if (!enrollments || enrollments.length === 0) {
    return <div>登録されているコースはありません</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">マイコース</h1>
      <CourseList
        courses={enrollments.map((enrollment: Enrollment) => enrollment.course)}
      />
    </div>
  );
}
