// ログインフォームの型
export interface LoginFormData {
  email: string;
  password: string;
}

// サインアップフォームの型
export interface SignupFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// コース作成/編集フォームの型
export interface CourseFormData {
  title: string;
  description: string;
  startDate?: Date;
  endDate?: Date;
  capacity?: number;
}

// 課題作成/編集フォームの型
export interface AssignmentFormData {
  title: string;
  description: string;
  dueDate: Date;
  points: number;
  courseId: string;
}

// 課題提出フォームの型
export interface SubmissionFormData {
  assignmentId: string;
  content: string;
  attachments?: File[];
}

// 教材作成/編集フォームの型
export interface MaterialFormData {
  title: string;
  description: string;
  type: "document" | "video" | "link";
  content: string;
  courseId: string;
}

// ユーザープロフィール編集フォームの型
export interface UserProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  avatar?: File;
}

// パスワード変更フォームの型
export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
