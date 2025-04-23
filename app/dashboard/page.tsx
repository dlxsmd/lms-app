"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Course, Assignment } from "@/app/types";

interface EnrolledCourse {
  course: Course;
}

interface Submission {
  id: string;
  student_id: string;
  grade: number | null;
  submission_number: number;
}

interface AssignmentWithSubmissions extends Assignment {
  submissions: Submission[] | null;
  courses: {
    id: string;
    title: string;
  };
}

interface AssignmentDisplay extends Assignment {
  course: {
    id: string;
    title: string;
  };
  current_grade: number | null;
  submission_number: number;
}

// 定数定義
const MAX_DISPLAYED_ASSIGNMENTS = 5; // 表示する最大課題数

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<AssignmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    console.log("🔄 Dashboard: Component mounted");

    // ダッシュボードデータの取得
    async function fetchDashboardData() {
      try {
        console.log("🔍 Dashboard: Fetching user data...");
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("❌ Dashboard: User fetch error:", userError);
          return;
        }

        if (!user) {
          console.log("⚠️ Dashboard: No user found");
          return;
        }

        console.log("👤 Dashboard: User found:", user.id);

        // 受講中のコースを取得
        console.log("📚 Dashboard: Fetching enrolled courses...");
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*");

        if (coursesError) {
          console.error("❌ Dashboard: Course fetch error:", coursesError);
          throw coursesError;
        }
        if (!coursesData) {
          console.log("ℹ️ Dashboard: No enrolled courses found");
          return;
        }

        console.log("📊 Dashboard: Found courses:", coursesData.length);

        const courses = coursesData as Course[];
        const courseIds = courses.map((course) => course.id);

        // 締め切りが近い課題を取得
        console.log("📝 Dashboard: Fetching upcoming assignments...");
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        // 課題とその提出状況を取得
        const { data: assignmentsData, error: assignmentsError } =
          await supabase
            .from("assignments")
            .select(
              `
            *,
            courses!inner(
              id,
              title
            ),
            submissions!left(
              id,
              student_id,
              grade,
              submission_number
            )
          `
            )
            .gte("due_date", new Date().toISOString());

        if (assignmentsError) {
          console.error(
            "❌ Dashboard: Assignments fetch error:",
            assignmentsError
          );
          throw assignmentsError;
        }

        // 未提出の課題と再提出可能な課題をフィルタリング
        const assignments =
          assignmentsData
            ?.filter((assignment: AssignmentWithSubmissions) => {
              const submission = assignment.submissions?.find(
                (sub: any) => sub.student_id === user.id
              );

              // 未提出の課題
              if (!submission) {
                return true;
              }

              // 再提出可能な課題（満点でない場合）
              if (
                assignment.allow_resubmission &&
                submission.grade !== assignment.points_possible &&
                (!assignment.max_attempts ||
                  submission.submission_number < assignment.max_attempts)
              ) {
                return true;
              }

              return false;
            })
            .map((assignment: AssignmentWithSubmissions): AssignmentDisplay => {
              const submission = assignment.submissions?.find(
                (sub: any) => sub.student_id === user.id
              );
              return {
                ...assignment,
                course: {
                  id: assignment.courses.id,
                  title: assignment.courses.title,
                },
                current_grade: submission?.grade ?? null,
                submission_number: submission?.submission_number || 0,
              };
            })
            .sort(
              (a, b) =>
                new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
            )
            .slice(0, MAX_DISPLAYED_ASSIGNMENTS) || [];

        console.log(
          "📊 Dashboard: Found assignments to work on:",
          assignments.length
        );

        setCourses(courses);
        setAssignments(assignments);
      } catch (error) {
        console.error("❌ Dashboard: Error fetching dashboard data:", error);
      } finally {
        console.log("✅ Dashboard: Data fetch completed");
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin"></div>
            <div className="w-12 h-12 border-t-4 border-indigo-600 rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
          <p className="mt-2 text-sm text-gray-500">
            コンテンツを準備しています
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* コースセクション */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">マイコース</h2>
          <div className="space-y-4">
            {courses.length > 0 ? (
              courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="block p-4 border rounded-md hover:bg-gray-50"
                >
                  <h3 className="font-medium">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {course.description}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                現在受講中のコースはありません
              </p>
            )}

            <div className="text-center mt-6">
              <Link
                href="/courses"
                className="text-indigo-600 hover:text-indigo-800"
              >
                すべてのコースを表示
              </Link>
            </div>
          </div>
        </div>

        {/* 締め切りが近い課題と再提出可能な課題 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">取り組むべき課題</h2>
            {assignments.length === MAX_DISPLAYED_ASSIGNMENTS && (
              <span className="text-sm text-gray-500">
                ※ 締切が近い{MAX_DISPLAYED_ASSIGNMENTS}件を表示中
              </span>
            )}
          </div>

          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const isSubmitted = assignment.submission_number > 0;
                const dueDate = new Date(assignment.due_date);
                const today = new Date();
                const daysUntilDue = Math.ceil(
                  (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <Link
                    key={assignment.id}
                    href={`/courses/${assignment.course_id}/assignments/${assignment.id}`}
                    className="block p-4 border rounded-md hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{assignment.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          コース: {assignment.course.title}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isSubmitted && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md">
                            再提出可能
                          </span>
                        )}
                        <span
                          className={`text-xs rounded-md px-2 py-1 ${
                            daysUntilDue <= 1
                              ? "bg-red-100 text-red-800"
                              : daysUntilDue <= 3
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {daysUntilDue <= 0
                            ? "今日が締切"
                            : `締切まで${daysUntilDue}日`}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      {isSubmitted && (
                        <p className="text-sm text-gray-600">
                          現在の得点: {assignment.current_grade} /{" "}
                          {assignment.points_possible}点
                        </p>
                      )}
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          締め切り:{" "}
                          {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                        <span>
                          {assignment.max_attempts
                            ? `提出回数: ${assignment.submission_number} / ${assignment.max_attempts}`
                            : "提出回数制限なし"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              現在取り組むべき課題はありません
            </p>
          )}
        </div>
      </div>

      {/* お知らせと最近のアクティビティ */}
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">お知らせ</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium">システムメンテナンスのお知らせ</h3>
              <p className="text-sm text-gray-500 mt-1">
                6月10日の午前2時から5時までシステムメンテナンスを行います。
              </p>
              <p className="text-xs text-gray-500 mt-2">2023年6月5日</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">最近のアクティビティ</h2>
          <div className="space-y-4">
            {/* アクティビティは後ほど実装予定 */}
            <p className="text-center text-gray-500 py-4">
              最近のアクティビティはありません
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
