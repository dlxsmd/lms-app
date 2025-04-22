"use client";

import { useState } from "react";
import { createCourse, updateCourse } from "../../lib/courses";
import { Course } from "../../types";

interface CourseFormProps {
  teacherId: string;
  existingCourse?: Course;
  onSuccess: (course: Course) => void;
}

export default function CourseForm({
  teacherId,
  existingCourse,
  onSuccess,
}: CourseFormProps) {
  const [title, setTitle] = useState(existingCourse?.title || "");
  const [description, setDescription] = useState(
    existingCourse?.description || ""
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    existingCourse?.cover_image_url || ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("タイトルと説明は必須です。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const courseData = {
        title,
        description,
        teacher_id: teacherId,
        cover_image_url: coverImageUrl || undefined,
        is_active: true,
      };

      let result;

      if (existingCourse) {
        result = await updateCourse(existingCourse.id, courseData);
      } else {
        result = await createCourse(courseData);
      }

      onSuccess(result);
    } catch (err: any) {
      setError(err.message || "コースの保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {existingCourse ? "コースを編集" : "新規コースを作成"}
      </h2>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            コースタイトル
          </label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            コース説明
          </label>
          <textarea
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="coverImageUrl"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            カバー画像URL（任意）
          </label>
          <input
            type="url"
            id="coverImageUrl"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
          />

          {coverImageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">プレビュー:</p>
              <img
                src={coverImageUrl}
                alt="Cover preview"
                className="w-full h-40 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/640x360?text=画像読み込みエラー";
                }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? "保存中..." : existingCourse ? "更新" : "作成"}
          </button>
        </div>
      </form>
    </div>
  );
}
