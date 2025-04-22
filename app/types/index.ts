export type UserRole = "teacher" | "student";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  cover_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  enrollment_date: string;
  status: "active" | "completed" | "dropped";
}

export type ProblemType =
  | "multiple_choice"
  | "short_answer"
  | "essay"
  | "file_upload"
  | "code";

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  problem_type: ProblemType;
  content: any;
  due_date: string;
  points_possible: number;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_content: any;
  submitted_at: string;
  grade?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
}

export type MaterialType = "document" | "video" | "link" | "other";

export interface Material {
  id: string;
  course_id: string;
  title: string;
  description: string;
  type: MaterialType;
  content_url: string;
  created_at: string;
  updated_at: string;
}
