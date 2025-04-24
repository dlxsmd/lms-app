import {
  User,
  Course,
  Assignment,
  Submission,
  Material,
} from "./database.types";
import { LoginFormData, SignupFormData } from "./forms.types";

// 認証フォームの型
export interface AuthFormProps {
  mode: "login" | "signup";
  onSubmit: (data: LoginFormData | SignupFormData) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

// コースカードの型
export interface CourseCardProps {
  course: Course;
  role: "teacher" | "student";
  onEnroll?: () => Promise<void>;
  onEdit?: () => void;
}

// 課題カードの型
export interface AssignmentCardProps {
  assignment: Assignment;
  role: "teacher" | "student";
  submission?: Submission;
  onSubmit?: () => void;
  onEdit?: () => void;
}

// 教材カードの型
export interface MaterialCardProps {
  material: Material;
  role: "teacher" | "student";
  onView: () => void;
  onEdit?: () => void;
}

// ユーザープロフィールの型
export interface UserProfileProps {
  user: User;
  isEditable?: boolean;
  onEdit?: () => void;
}

// ダッシュボードの型
export interface DashboardProps {
  user: User;
  courses: Course[];
  recentAssignments: Assignment[];
  recentSubmissions: Submission[];
}

// ナビゲーションの型
export interface NavigationProps {
  user: User | null;
  onLogout: () => void;
}

// モーダルの型
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// ページネーションの型
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
