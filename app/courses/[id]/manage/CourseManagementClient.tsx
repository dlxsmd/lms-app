"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../../lib/auth";
import { getCourseById } from "../../../lib/courses";
import { getAssignments, deleteAssignment } from "../../../lib/assignments";
import { getMaterials, deleteMaterial } from "../../../lib/materials";
import { getEnrolledStudents } from "../../../lib/courses";
import Navbar from "../../../components/Layout/Navbar";
import AssignmentCard from "../../../components/Assignment/AssignmentCard";
import { User, Course, Assignment, Material } from "../../../types";

export default function CourseManagementClient({ id }: { id: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("assignments");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          router.push("/auth?registered=true");
          return;
        }

        if (currentUser.role !== "teacher") {
          router.push("/dashboard");
          return;
        }

        setUser(currentUser);

        const courseData = await getCourseById(id);

        if (courseData.teacher_id !== currentUser.id) {
          setError("このコースを管理する権限がありません。");
          return;
        }

        setCourse(courseData);

        const [assignmentsData, materialsData, studentsData] =
          await Promise.all([
            getAssignments(id),
            getMaterials(id),
            getEnrolledStudents(id),
          ]);

        setAssignments(assignmentsData);
        setMaterials(materialsData);
        setStudents(studentsData);
      } catch (err) {
        console.error("データの読み込みに失敗しました:", err);
        setError("コースデータの読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  const handleDeleteAssignment = async (id: string) => {
    if (window.confirm("この課題を削除してもよろしいですか？")) {
      try {
        await deleteAssignment(id);
        setAssignments(assignments.filter((a) => a.id !== id));
      } catch (err) {
        console.error("課題の削除に失敗しました:", err);
      }
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (window.confirm("この教材を削除してもよろしいですか？")) {
      try {
        await deleteMaterial(id);
        setMaterials(materials.filter((m) => m.id !== id));
      } catch (err) {
        console.error("教材の削除に失敗しました:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <p className="text-lg text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-red-600">
              {error || "コースが見つかりませんでした。"}
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <Link
              href={`/courses/${course.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              コースを編集
            </Link>
          </div>
          <p className="mt-2 text-gray-600">{course.description}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("assignments")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "assignments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                課題 ({assignments.length})
              </button>
              <button
                onClick={() => setActiveTab("materials")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "materials"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                教材 ({materials.length})
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "students"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                学生 ({students.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "assignments" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    課題一覧
                  </h2>
                  <Link
                    href={`/courses/${course.id}/assignments/create`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    新規課題作成
                  </Link>
                </div>

                {assignments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        isTeacher={true}
                        onDelete={handleDeleteAssignment}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      このコースにはまだ課題がありません。
                    </p>
                    <Link
                      href={`/courses/${course.id}/assignments/create`}
                      className="mt-4 inline-block text-blue-600 hover:underline"
                    >
                      課題を作成する
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "materials" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    教材一覧
                  </h2>
                  <Link
                    href={`/courses/${course.id}/materials/create`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    新規教材追加
                  </Link>
                </div>

                {materials.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md"
                      >
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-1">
                            {material.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {material.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <a
                              href={material.content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              教材を開く
                            </a>
                            <button
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      このコースにはまだ教材がありません。
                    </p>
                    <Link
                      href={`/courses/${course.id}/materials/create`}
                      className="mt-4 inline-block text-blue-600 hover:underline"
                    >
                      教材を追加する
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "students" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    登録学生一覧
                  </h2>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => {
                      // 学生追加モーダルを表示する処理
                      alert("学生追加機能は現在開発中です。");
                    }}
                  >
                    学生を追加
                  </button>
                </div>

                {students.length > 0 ? (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {students.map((enrollment) => (
                        <li key={enrollment.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded-full"
                                    src={
                                      enrollment.users.avatar_url ||
                                      `https://ui-avatars.com/api/?name=${enrollment.users.first_name}+${enrollment.users.last_name}&background=random`
                                    }
                                    alt=""
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {enrollment.users.first_name}{" "}
                                    {enrollment.users.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {enrollment.users.email}
                                  </div>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    enrollment.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : enrollment.status === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {enrollment.status === "active"
                                    ? "進行中"
                                    : enrollment.status === "completed"
                                    ? "完了"
                                    : "中断"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      このコースにはまだ学生が登録されていません。
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
