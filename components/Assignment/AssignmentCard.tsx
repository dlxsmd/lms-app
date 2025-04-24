"use client";

import Link from "next/link";
import { Assignment } from "../../types";

interface AssignmentCardProps {
  assignment: Assignment;
  isTeacher?: boolean;
  onDelete?: (id: string) => void;
}

export default function AssignmentCard({
  assignment,
  isTeacher = false,
  onDelete,
}: AssignmentCardProps) {
  const dueDate = new Date(assignment.due_date);
  const isPastDue = dueDate < new Date();

  // 問題タイプに応じたアイコンを表示
  const getProblemTypeIcon = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "📝";
      case "short_answer":
        return "📄";
      case "essay":
        return "📃";
      case "file_upload":
        return "📎";
      case "code":
        return "💻";
      default:
        return "📋";
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md transition-shadow hover:shadow-lg">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{assignment.title}</h3>
          <span
            className="text-2xl"
            title={`問題タイプ: ${assignment.problem_type}`}
          >
            {getProblemTypeIcon(assignment.problem_type)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {assignment.description}
        </p>

        <div className="flex justify-between items-center text-sm mb-4">
          <div className={`${isPastDue ? "text-red-600" : "text-green-600"}`}>
            提出期限: {dueDate.toLocaleDateString("ja-JP")}
          </div>
          <div className="font-semibold">
            配点: {assignment.points_possible}点
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Link
            href={
              isTeacher
                ? `/assignments/${assignment.id}/submissions`
                : `/assignments/${assignment.id}`
            }
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {isTeacher ? "提出物を確認" : "課題に取り組む"}
          </Link>

          {isTeacher && onDelete && (
            <button
              onClick={() => onDelete(assignment.id)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              削除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
