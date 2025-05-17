import React from "react";
import Link from "next/link";
import { getMaterials } from "@/lib/materials";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: courseId } = await params;
  
  try {
    const supabase = await createClient();

    // ユーザー情報を取得
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return notFound();
    }

    // コース情報を取得（講師の情報も含める）
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select(
        `
        *,
        users!courses_teacher_id_fkey (
          first_name,
          last_name
        )
      `
      )
      .eq("id", courseId)
      .single();

    if (courseError) {
      console.error("コースの取得に失敗しました:", courseError);
      return null;
    }

    if (!courseData) {
      return notFound();
    }

    const course = {
      ...courseData,
      teacher_name: `${courseData.users.first_name} ${courseData.users.last_name}`,
    };

    // 課題を取得（提出状況も含める）
    const { data: assignments, error: assignmentsError } = await supabase
      .from("assignments")
      .select("*")
      .eq("course_id", courseId)
      .order("due_date", { ascending: true });

    if (assignmentsError) {
      console.error("課題の取得に失敗しました:", assignmentsError);
      return null;
    }

    // 教材を取得
    const courseMaterials = await getMaterials(courseId);

    if (!course) {
      return notFound();
    }

    // 各課題の提出状況を確認
    const assignmentsWithStatus = assignments.map((assignment) => {
      const latestSubmission = assignment.submissions
        ?.filter((s: any) => s.student_id === user.id)
        .sort(
          (a: any, b: any) =>
            new Date(b.submitted_at).getTime() -
            new Date(a.submitted_at).getTime()
        )[0];

      return {
        ...assignment,
        submission_status: latestSubmission
          ? latestSubmission.status
          : "not_submitted",
        score: latestSubmission?.score,
      };
    });

    return (
      <div className="container mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <div className="flex flex-wrap gap-4">
            <span className="text-sm text-gray-500">
              講師: {course.teacher_name}
            </span>
            <span className="text-sm text-gray-500">
              作成日: {new Date(course.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 課題セクション */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">課題</h2>
              <Link
                href={`/courses/${courseId}/assignments`}
                className="text-indigo-600 hover:text-indigo-800"
              >
                すべて表示
              </Link>
            </div>

            {assignmentsWithStatus.length > 0 ? (
              <div className="space-y-4">
                {assignmentsWithStatus.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/courses/${courseId}/assignments/${assignment.id}`}
                    className="block p-4 border rounded-md hover:bg-gray-50 relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium pr-20">{assignment.title}</h3>
                      {/* 提出状況バッジ */}
                      <div
                        className={`absolute top-4 right-4 px-2 py-1 rounded text-sm ${
                          assignment.submission_status === "graded"
                            ? "bg-green-100 text-green-800"
                            : assignment.submission_status === "submitted"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {assignment.submission_status === "graded"
                          ? `採点済み (${assignment.score}/${assignment.points_possible}点)`
                          : assignment.submission_status === "submitted"
                          ? "提出済み"
                          : "未提出"}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                      {assignment.description}
                    </p>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>
                        提出期限:{" "}
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                      <span>配点: {assignment.points_possible}点</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                課題はまだありません
              </p>
            )}
          </div>

          {/* 教材セクション */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">教材</h2>
              <Link
                href={`/courses/${courseId}/materials`}
                className="text-indigo-600 hover:text-indigo-800"
              >
                すべて表示
              </Link>
            </div>

            {courseMaterials.length > 0 ? (
              <div className="space-y-4">
                {courseMaterials.map((material) => (
                  <Link
                    key={material.id}
                    href={material.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border rounded-md hover:bg-gray-50"
                  >
                    <h3 className="font-medium">{material.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {material.description}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="capitalize">
                        タイプ:{" "}
                        {material.type === "document"
                          ? "ドキュメント"
                          : material.type === "video"
                          ? "ビデオ"
                          : material.type === "link"
                          ? "リンク"
                          : "その他"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                教材はまだありません
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-800"
          >
            ダッシュボードに戻る
          </Link>
          <Link
            href={`/courses/${courseId}/manage`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            コース管理
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error:", error);
    return <div>エラーが発生しました。</div>;
  }
}