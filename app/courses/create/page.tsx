// @jsxImportSource react
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import Navbar from "../../components/Layout/Navbar";
import CourseForm from "../../components/Course/CourseForm";
import { User, Course } from "../../types";

export default function CreateCourse() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          router.push("/auth/login");
          return;
        }

        if (currentUser.role !== "teacher") {
          router.push("/dashboard");
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error("ユーザー情報の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  const handleSuccess = (course: Course) => {
    router.push(`/courses/${course.id}/manage`);
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">新規コース作成</h1>
          <p className="mt-2 text-gray-600">
            新しいコースの詳細を入力してください。
          </p>
        </div>

        {user && <CourseForm teacherId={user.id} onSuccess={handleSuccess} />}
      </div>
    </div>
  );
}
