import React from "react";
import Link from "next/link";
import { getAssignmentsByCourseId } from "@/app/lib/assignments";
import { getCourseById } from "@/app/lib/courses";
import { getMaterials } from "@/app/lib/materials";
import { notFound } from "next/navigation";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: courseId } = await params;

  try {
    // コース情報を取得
    const course = await getCourseById(courseId);

    // 課題を取得
    const courseAssignments = await getAssignmentsByCourseId(courseId);

    // 教材を取得
    const courseMaterials = await getMaterials(courseId);

    if (!course) {
      return notFound();
    }

    return (
      <div className="container mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <div className="flex flex-wrap gap-4">
            <span className="text-sm text-gray-500">
              講師ID: {course.teacher_id}
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

            {courseAssignments.length > 0 ? (
              <div className="space-y-4">
                {courseAssignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/courses/${courseId}/assignments/${assignment.id}`}
                    className="block p-4 border rounded-md hover:bg-gray-50"
                  >
                    <h3 className="font-medium">{assignment.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
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
    console.error("Error loading course:", error);
    return notFound();
  }
}
