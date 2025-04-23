"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Course, Assignment } from "@/app/types";
import ActivityList from "@/app/components/Activity/ActivityList";

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
  const [currentUser, setCurrentUser] = useState<any>(null);

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

        setCurrentUser(user);
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側のメインコンテンツ */}
        <div className="lg:col-span-2 space-y-8">
          {/* 課題セクション */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">取り組むべき課題</h2>
            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const isSubmitted = assignment.submission_number > 0;
                  const dueDate = new Date(assignment.due_date);
                  const today = new Date();
                  const daysUntilDue = Math.ceil(
                    (dueDate.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24)
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
              <p className="text-gray-500">現在取り組むべき課題はありません</p>
            )}
          </section>

          {/* コースセクション */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">受講中のコース</h2>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
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
                ))}
              </div>
            ) : (
              <p className="text-gray-500">受講中のコースはありません</p>
            )}
          </section>
        </div>

        {/* 右側のサイドバー */}
        <div className="space-y-8">
          {/* アクティビティリスト */}
          {currentUser && (
            <section className="bg-white rounded-lg shadow p-6">
              <ActivityList userId={currentUser.id} limit={10} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
