import React from "react";
import Link from "next/link";
import { mockAssignments, formatDate } from "@/app/mockData";

interface AssignmentsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssignmentsPage({
  params,
}: AssignmentsPageProps) {
  const { id } = await params;
  const courseId = id;
  const courseAssignments = mockAssignments.filter(
    (assignment) => assignment.courseId === courseId
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">課題一覧</h1>
        <Link
          href={`/courses/${courseId}/assignments/create`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          新規課題作成
        </Link>
      </div>

      {courseAssignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">この講座にはまだ課題がありません。</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courseAssignments.map((assignment) => (
            <Link
              href={`/courses/${courseId}/assignments/${assignment.id}`}
              key={assignment.id}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">
                  {assignment.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {assignment.description}
                </p>
                <div className="flex flex-col text-sm text-gray-500">
                  <span>提出期限: {formatDate(assignment.dueDate)}</span>
                  <span>配点: {assignment.totalPoints}点</span>
                  <span className="capitalize">
                    種類:{" "}
                    {assignment.type === "quiz"
                      ? "クイズ"
                      : assignment.type === "assignment"
                      ? "レポート課題"
                      : assignment.type === "discussion"
                      ? "ディスカッション"
                      : assignment.type}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
