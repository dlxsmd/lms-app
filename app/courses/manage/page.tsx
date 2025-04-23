import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Course {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  created_at: string;
  course_enrollments: { count: number }[];
}

export default async function CourseManagementPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: courses, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      description,
      teacher_id,
      created_at,
      course_enrollments (count)
    `
    )
    .eq("teacher_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            コースの取得中にエラーが発生しました
          </p>
          <Link href="/dashboard" className="text-blue-500 hover:text-blue-600">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">コース管理</h1>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ダッシュボード
          </Link>
          <Link
            href="/courses/new"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            新規コース作成
          </Link>
        </div>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">作成したコースはありません</p>
          <Link
            href="/courses/new"
            className="text-blue-500 hover:text-blue-600"
          >
            最初のコースを作成する
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  受講者数: {course.course_enrollments[0]?.count || 0}人
                </span>
                <span>
                  作成日: {new Date(course.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/courses/${course.id}`}
                  className="flex-1 px-3 py-2 text-center text-blue-500 border border-blue-500 rounded hover:bg-blue-50 transition-colors"
                >
                  詳細
                </Link>
                <Link
                  href={`/courses/${course.id}/edit`}
                  className="flex-1 px-3 py-2 text-center text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                >
                  編集
                </Link>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  href={`/courses/${course.id}/assignments`}
                  className="px-3 py-2 text-center text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  課題管理
                </Link>
                <Link
                  href={`/courses/${course.id}/students`}
                  className="px-3 py-2 text-center text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  受講者管理
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
