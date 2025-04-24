"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Layout/Navbar";

// モックデータ
const courseMock = {
  id: "course-123",
  title: "Reactプログラミング入門",
  description:
    "Reactフレームワークの基礎から応用までを学びます。コンポーネント、状態管理、ルーティングなどを実践形式で習得します。",
  teacher_id: "teacher-123",
};

const assignmentsMock = [
  {
    id: "assignment-1",
    title: "React基礎の理解",
    description: "Reactの基本概念とコンポーネントの作成方法について学びます。",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    course_id: "course-123",
    max_score: 100,
    status: "active",
  },
  {
    id: "assignment-2",
    title: "状態管理の実装",
    description: "useStateとuseEffectを使った状態管理を実装します。",
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    course_id: "course-123",
    max_score: 100,
    status: "active",
  },
  {
    id: "assignment-3",
    title: "ルーティングの実装",
    description: "Next.jsのApp Routerを使ったルーティングを実装します。",
    due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    course_id: "course-123",
    max_score: 100,
    status: "active",
  },
];

const materialsMock = [
  {
    id: "material-1",
    title: "React基礎講義スライド",
    description: "Reactの基本概念と構文についての解説スライドです。",
    content_url: "https://example.com/react-slides",
    course_id: "course-123",
  },
  {
    id: "material-2",
    title: "状態管理サンプルコード",
    description: "useState、useEffectを使用したサンプルコードとその解説です。",
    content_url: "https://example.com/state-management-code",
    course_id: "course-123",
  },
];

const studentsMock = [
  {
    id: "enroll-1",
    users: {
      id: "student-1",
      first_name: "太郎",
      last_name: "山田",
      email: "taro@example.com",
      avatar_url: null,
    },
    status: "active",
  },
  {
    id: "enroll-2",
    users: {
      id: "student-2",
      first_name: "花子",
      last_name: "佐藤",
      email: "hanako@example.com",
      avatar_url: null,
    },
    status: "active",
  },
  {
    id: "enroll-3",
    users: {
      id: "student-3",
      first_name: "一郎",
      last_name: "鈴木",
      email: "ichiro@example.com",
      avatar_url: null,
    },
    status: "completed",
  },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

// サンプル用のAssignmentCardコンポーネント
function AssignmentCard({
  assignment,
  onDelete,
}: {
  assignment: any;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{assignment.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
        <div className="text-xs text-gray-500 mb-2">
          提出期限: {formatDate(assignment.due_date)}
        </div>
        <div className="flex justify-between items-center">
          <Link
            href={`/courses/${assignment.course_id}/assignments/${assignment.id}`}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            詳細を見る
          </Link>
          <button
            onClick={() => onDelete(assignment.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CourseManagementPage() {
  const [activeTab, setActiveTab] = useState("assignments");
  const [assignments, setAssignments] = useState(assignmentsMock);
  const [materials, setMaterials] = useState(materialsMock);
  const [students] = useState(studentsMock);
  const course = courseMock;

  const handleDeleteAssignment = (id: string) => {
    if (window.confirm("この課題を削除してもよろしいですか？")) {
      setAssignments(assignments.filter((a) => a.id !== id));
    }
  };

  const handleDeleteMaterial = (id: string) => {
    if (window.confirm("この教材を削除してもよろしいですか？")) {
      setMaterials(materials.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <Link
              href={`/courses/${course.id}/edit`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              コースを編集
            </Link>
          </div>
          <p className="mt-2 text-gray-600">{course.description}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("assignments")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "assignments"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                課題 ({assignments.length})
              </button>
              <button
                onClick={() => setActiveTab("materials")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "materials"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                教材 ({materials.length})
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "students"
                    ? "border-indigo-500 text-indigo-600"
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
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
                      className="mt-4 inline-block text-indigo-600 hover:underline"
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
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    新規教材追加
                  </Link>
                </div>

                {materials.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
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
                              className="text-indigo-600 hover:underline"
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
                      className="mt-4 inline-block text-indigo-600 hover:underline"
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
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    onClick={() => {
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
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <span className="text-indigo-600 font-medium">
                                    {enrollment.users.first_name.charAt(0)}
                                    {enrollment.users.last_name.charAt(0)}
                                  </span>
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
