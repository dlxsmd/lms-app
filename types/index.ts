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
  allow_resubmission: boolean;
  max_attempts?: number;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_at: string;
  submission_content: any;
  grade: number | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
  submission_number: number;
}

export interface AssignmentDisplay extends Assignment {
  course: {
    id: string;
    title: string;
  };
  current_grade?: number | null;
  submission_number: number;
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

export type ActivityType =
  | "submission"
  | "grade_received"
  | "feedback_received"
  | "course_enrolled"
  | "assignment_created";

export interface Activity {
  id: string;
  user_id: string;
  type: ActivityType;
  content: {
    course_id?: string;
    course_title?: string;
    assignment_id?: string;
    assignment_title?: string;
    grade?: number;
    submission_id?: string;
  };
  created_at: string;
}
