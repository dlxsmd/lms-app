"use client";

import Link from "next/link";
import { Course } from "../../types";

interface CourseCardProps {
  course: Course;
  isTeacher?: boolean;
  onDelete?: (id: string) => void;
}

export default function CourseCard({
  course,
  isTeacher = false,
  onDelete,
}: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md transition-shadow hover:shadow-lg">
      <div className="relative pb-1/2">
        <img
          src={
            course.cover_image_url ||
            "https://via.placeholder.com/640x360?text=コース画像なし"
          }
          alt={course.title}
          className="absolute h-full w-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex justify-between items-center">
          <Link
            href={
              isTeacher
                ? `/courses/${course.id}/manage`
                : `/courses/${course.id}`
            }
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {isTeacher ? "管理" : "参照"}
          </Link>

          {isTeacher && onDelete && (
            <button
              onClick={() => onDelete(course.id)}
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
