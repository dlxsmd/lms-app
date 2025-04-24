import {
  User,
  Course,
  Assignment,
  Submission,
  Material,
  Activity,
  CourseEnrollment,
} from "./database.types";

// 基本的なAPIレスポンス型
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// 認証関連のレスポンス
export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    expires_at: number;
  };
}

// ページネーション付きレスポンス
export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

// コース関連のレスポンス
export interface CourseDetailsResponse {
  course: Course;
  teacher: User;
  enrollments: CourseEnrollment[];
  assignments: Assignment[];
  materials: Material[];
}

export interface CourseEnrollmentResponse {
  enrollment: CourseEnrollment;
  course: Course;
}

// 課題関連のレスポンス
export interface AssignmentDetailsResponse {
  assignment: Assignment;
  course: Course;
  submissions?: Submission[];
}

export interface SubmissionDetailsResponse {
  submission: Submission;
  assignment: Assignment;
  student: User;
}

// 教材関連のレスポンス
export interface MaterialDetailsResponse {
  material: Material;
  course: Course;
}

// ダッシュボード関連のレスポンス
export interface DashboardResponse {
  user: User;
  courses: Course[];
  recentAssignments: Assignment[];
  recentSubmissions: Submission[];
  activities: Activity[];
}

// ユーザープロフィール関連のレスポンス
export interface UserProfileResponse {
  user: User;
  enrolledCourses: Course[];
  teachingCourses?: Course[];
  recentActivities: Activity[];
}

// 統計情報のレスポンス
export interface CourseStatisticsResponse {
  courseId: string;
  totalStudents: number;
  averageGrade: number;
  assignmentCompletionRate: number;
  studentProgress: {
    studentId: string;
    completedAssignments: number;
    averageGrade: number;
  }[];
}

// 検索結果のレスポンス
export interface SearchResponse {
  courses?: Course[];
  assignments?: Assignment[];
  materials?: Material[];
  users?: User[];
}

// エラーレスポンス
export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: Record<string, any>;
  };
}
