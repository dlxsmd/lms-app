"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Course, Assignment } from "@/app/types";

interface EnrolledCourse {
  course: Course;
}

interface AssignmentWithCourse extends Assignment {
  course: {
    title: string;
  };
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithCourse[]>([]);
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
        const { data: enrolledCoursesData, error: coursesError } =
          await supabase
            .from("course_enrollments")
            .select("course:courses(*)")
            .eq("student_id", user.id);

        if (coursesError) {
          console.error("❌ Dashboard: Course fetch error:", coursesError);
          throw coursesError;
        }
        if (!enrolledCoursesData) {
          console.log("ℹ️ Dashboard: No enrolled courses found");
          return;
        }

        console.log("📊 Dashboard: Found courses:", enrolledCoursesData.length);

        const enrolledCourses =
          enrolledCoursesData as unknown as EnrolledCourse[];
        const courseIds = enrolledCourses.map(
          (enrollment) => enrollment.course.id
        );

        // 締め切りが近い課題を取得
        console.log("📝 Dashboard: Fetching upcoming assignments...");
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const { data: upcomingAssignmentsData, error: assignmentsError } =
          await supabase
            .from("assignments")
            .select(
              `
            *,
            course:courses(title)
          `
            )
            .in("course_id", courseIds)
            .gte("due_date", today.toISOString())
            .lte("due_date", nextWeek.toISOString())
            .order("due_date", { ascending: true })
            .limit(5);

        if (assignmentsError) {
          console.error(
            "❌ Dashboard: Assignment fetch error:",
            assignmentsError
          );
          throw assignmentsError;
        }
        if (!upcomingAssignmentsData) {
          console.log("ℹ️ Dashboard: No upcoming assignments found");
          return;
        }

        console.log(
          "📊 Dashboard: Found assignments:",
          upcomingAssignmentsData.length
        );

        setCourses(enrolledCourses.map((enrollment) => enrollment.course));
        setAssignments(
          upcomingAssignmentsData as unknown as AssignmentWithCourse[]
        );
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
    return <div className="container mx-auto py-8 px-4">読み込み中...</div>;
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

        {/* 締め切りが近い課題 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">締め切りが近い課題</h2>

          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/courses/${assignment.course_id}/assignments/${assignment.id}`}
                  className="block p-4 border rounded-md hover:bg-gray-50"
                >
                  <h3 className="font-medium">{assignment.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    コース: {assignment.course.title}
                  </p>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>
                      締め切り:{" "}
                      {new Date(assignment.due_date).toLocaleDateString()}
                    </span>
                    <span>配点: {assignment.points_possible}点</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              今週締め切りの課題はありません
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
