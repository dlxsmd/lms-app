"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface NewCourseFormProps {
  userId: string;
}

export default function NewCourseForm({ userId }: NewCourseFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;

      const { data: course, error } = await supabase
        .from("courses")
        .insert([
          {
            title,
            description,
            teacher_id: userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success("コースを作成しました");
      router.push(`/courses/${course.id}`);
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("コースの作成中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          コースタイトル
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="例: プログラミング入門"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          コース説明
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="コースの説明を入力してください"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
          {loading ? "作成中..." : "作成"}
        </button>
      </div>
    </form>
  );
}
