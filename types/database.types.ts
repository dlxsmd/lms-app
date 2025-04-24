// データベースの型定義
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: "teacher" | "student";
          avatar_url: string | null;
          created_at: string;
          last_login: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          role: "teacher" | "student";
          avatar_url?: string | null;
          created_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: "teacher" | "student";
          avatar_url?: string | null;
          created_at?: string;
          last_login?: string | null;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          teacher_id: string;
          cover_image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          teacher_id: string;
          cover_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          teacher_id?: string;
          cover_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_enrollments: {
        Row: {
          id: string;
          course_id: string;
          student_id: string;
          enrollment_date: string;
          status: "active" | "completed" | "dropped";
        };
        Insert: {
          id?: string;
          course_id: string;
          student_id: string;
          enrollment_date?: string;
          status?: "active" | "completed" | "dropped";
        };
        Update: {
          id?: string;
          course_id?: string;
          student_id?: string;
          enrollment_date?: string;
          status?: "active" | "completed" | "dropped";
        };
      };
      assignments: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          problem_type:
            | "multiple_choice"
            | "short_answer"
            | "essay"
            | "file_upload"
            | "code";
          content: Record<string, any>;
          due_date: string;
          points_possible: number;
          created_at: string;
          updated_at: string;
          allow_resubmission: boolean;
          max_attempts: number | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description: string;
          problem_type:
            | "multiple_choice"
            | "short_answer"
            | "essay"
            | "file_upload"
            | "code";
          content: Record<string, any>;
          due_date: string;
          points_possible: number;
          created_at?: string;
          updated_at?: string;
          allow_resubmission?: boolean;
          max_attempts?: number | null;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          problem_type?:
            | "multiple_choice"
            | "short_answer"
            | "essay"
            | "file_upload"
            | "code";
          content?: Record<string, any>;
          due_date?: string;
          points_possible?: number;
          created_at?: string;
          updated_at?: string;
          allow_resubmission?: boolean;
          max_attempts?: number | null;
        };
      };
      submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          submitted_at: string;
          submission_content: Record<string, any>;
          grade: number | null;
          feedback: string | null;
          graded_by: string | null;
          graded_at: string | null;
          submission_number: number;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          submitted_at?: string;
          submission_content: Record<string, any>;
          grade?: number | null;
          feedback?: string | null;
          graded_by?: string | null;
          graded_at?: string | null;
          submission_number?: number;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          submitted_at?: string;
          submission_content?: Record<string, any>;
          grade?: number | null;
          feedback?: string | null;
          graded_by?: string | null;
          graded_at?: string | null;
          submission_number?: number;
        };
      };
      materials: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          type: "document" | "video" | "link" | "other";
          content_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description: string;
          type: "document" | "video" | "link" | "other";
          content_url: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          type?: "document" | "video" | "link" | "other";
          content_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          type:
            | "submission"
            | "grade_received"
            | "feedback_received"
            | "course_enrolled"
            | "assignment_created";
          content: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type:
            | "submission"
            | "grade_received"
            | "feedback_received"
            | "course_enrolled"
            | "assignment_created";
          content: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?:
            | "submission"
            | "grade_received"
            | "feedback_received"
            | "course_enrolled"
            | "assignment_created";
          content?: Record<string, any>;
          created_at?: string;
        };
      };
    };
  };
}

// テーブル行の型エイリアス
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type CourseEnrollment =
  Database["public"]["Tables"]["course_enrollments"]["Row"];
export type Assignment = Database["public"]["Tables"]["assignments"]["Row"];
export type Submission = Database["public"]["Tables"]["submissions"]["Row"];
export type Material = Database["public"]["Tables"]["materials"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
