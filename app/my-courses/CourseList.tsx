"use client";

import { formatDate } from "../../lib/utils";

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  teacher: Teacher;
  created_at: string;
}

interface CourseListProps {
  courses: Course[];
}

export default function CourseList({ courses }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">コースがありません。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div
          key={course.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
        >
          {course.cover_image && (
            <div className="relative h-48">
              <img
                src={course.cover_image}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">
              {course.title}
            </h2>
            <p className="text-gray-600 mb-4 line-clamp-2">
              {course.description}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <span>講師: {course.teacher.full_name}</span>
              </div>
              <div>
                <span>作成日: {formatDate(course.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
