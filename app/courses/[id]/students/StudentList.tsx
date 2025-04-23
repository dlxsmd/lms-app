"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";

interface Enrollment {
  id: string;
  student: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  enrolled_at: string;
}

interface StudentListProps {
  courseId: string;
  initialEnrollments: Enrollment[];
}

export default function StudentList({
  courseId,
  initialEnrollments,
}: StudentListProps) {
  const [enrollments, setEnrollments] =
    useState<Enrollment[]>(initialEnrollments);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  const removeStudent = async (enrollmentId: string) => {
    if (!confirm("本当にこの学生を削除しますか？")) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .delete()
        .eq("id", enrollmentId);

      if (error) throw error;

      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
      toast.success("学生を削除しました");
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("学生の削除中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (enrollments.length === 0) {
    return (
      <p className="text-gray-500">
        この講座にはまだ学生が登録されていません。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {enrollments.map((enrollment) => (
        <div
          key={enrollment.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div>
            <p className="font-medium">
              {enrollment.student.first_name} {enrollment.student.last_name}
            </p>
            <p className="text-sm text-gray-500">{enrollment.student.email}</p>
          </div>
          <button
            onClick={() => removeStudent(enrollment.id)}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50"
          >
            削除
          </button>
        </div>
      ))}
    </div>
  );
}
