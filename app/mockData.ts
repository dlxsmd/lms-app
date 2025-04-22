export const mockCourse = {
  id: "course-123",
  title: "Webアプリケーション開発",
  description:
    "HTML, CSS, JavaScriptを使用した現代的なWebアプリケーション開発の基礎から応用までを学びます。",
  instructor: "山田 太郎",
  startDate: "2023-04-01",
  endDate: "2023-07-31",
  credits: 2,
  image: "/images/web-dev.jpg",
};

export const mockAssignments = [
  {
    id: "assignment-1",
    courseId: "course-123",
    title: "HTML/CSSの基本",
    description:
      "基本的なWebページを作成し、CSSでスタイリングを適用してください。",
    type: "practical",
    dueDate: "2023-06-15T23:59:59",
    totalPoints: 10,
    isPublished: true,
  },
  {
    id: "assignment-2",
    courseId: "course-123",
    title: "JavaScript基礎",
    description: "DOM操作と基本的なイベント処理について学びます。",
    type: "quiz",
    dueDate: "2023-06-30T23:59:59",
    totalPoints: 20,
    isPublished: true,
  },
  {
    id: "assignment-3",
    courseId: "course-123",
    title: "Reactコンポーネント作成",
    description:
      "Reactを使用して再利用可能なコンポーネントを作成してください。",
    type: "practical",
    dueDate: "2023-07-15T23:59:59",
    totalPoints: 30,
    isPublished: true,
  },
  {
    id: "assignment-4",
    courseId: "course-123",
    title: "最終プロジェクト",
    description: "学んだ技術を使用してWebアプリケーションを作成してください。",
    type: "report",
    dueDate: "2023-07-31T23:59:59",
    totalPoints: 40,
    isPublished: true,
  },
];

export const mockMaterials = [
  {
    id: "material-1",
    courseId: "course-123",
    title: "HTML/CSSの基本",
    description: "HTML要素とCSS選択子について解説します。",
    type: "document",
    url: "/materials/html-css-basics.pdf",
    uploadedAt: "2023-04-01T10:00:00",
  },
  {
    id: "material-2",
    courseId: "course-123",
    title: "JavaScript入門",
    description: "JavaScriptの基本構文とDOM操作について解説します。",
    type: "document",
    url: "/materials/javascript-intro.pdf",
    uploadedAt: "2023-04-15T10:00:00",
  },
  {
    id: "material-3",
    courseId: "course-123",
    title: "React基礎",
    description: "Reactの基本概念とコンポーネントについて解説します。",
    type: "video",
    url: "https://example.com/videos/react-basics",
    uploadedAt: "2023-05-01T10:00:00",
  },
];

export const mockStudents = [
  {
    id: "student-1",
    firstName: "鈴木",
    lastName: "一郎",
    email: "suzuki@example.com",
    enrolledCourses: ["course-123"],
  },
  {
    id: "student-2",
    firstName: "佐藤",
    lastName: "花子",
    email: "sato@example.com",
    enrolledCourses: ["course-123"],
  },
  {
    id: "student-3",
    firstName: "田中",
    lastName: "次郎",
    email: "tanaka@example.com",
    enrolledCourses: ["course-123"],
  },
];

export const mockQuizQuestions = [
  {
    id: "question-1",
    assignmentId: "assignment-2",
    text: "JavaScriptでDOM要素を取得するメソッドは次のうちどれですか？",
    options: [
      { id: 1, text: "getElementByName()" },
      { id: 2, text: "getElementById()" },
      { id: 3, text: "findElement()" },
      { id: 4, text: "selectElement()" },
    ],
    correctOptionId: 2,
    points: 5,
  },
  {
    id: "question-2",
    assignmentId: "assignment-2",
    text: "JavaScriptのイベントリスナーを追加するメソッドは？",
    options: [
      { id: 1, text: "addEvent()" },
      { id: 2, text: "listenEvent()" },
      { id: 3, text: "addEventListener()" },
      { id: 4, text: "createEvent()" },
    ],
    correctOptionId: 3,
    points: 5,
  },
  {
    id: "question-3",
    assignmentId: "assignment-2",
    text: "次のうち、配列のメソッドではないものはどれですか？",
    options: [
      { id: 1, text: "push()" },
      { id: 2, text: "pop()" },
      { id: 3, text: "insert()" },
      { id: 4, text: "shift()" },
    ],
    correctOptionId: 3,
    points: 10,
  },
];

export const mockSubmissions = [
  {
    id: "submission-1",
    assignmentId: "assignment-1",
    studentId: "student-1",
    submittedAt: "2023-06-10T14:30:00",
    content: "https://github.com/student1/html-css-assignment",
    status: "submitted",
    grade: null,
    feedback: null,
  },
  {
    id: "submission-2",
    assignmentId: "assignment-1",
    studentId: "student-2",
    submittedAt: "2023-06-12T09:15:00",
    content: "https://github.com/student2/html-css-assignment",
    status: "graded",
    grade: 8,
    feedback: "レスポンシブデザインについて改善の余地があります。",
  },
];

export const mockAnnouncements = [
  {
    id: "announcement-1",
    courseId: "course-123",
    title: "課題1の締め切り延長について",
    content: "システムの不具合により、課題1の締め切りを6月20日まで延長します。",
    createdAt: "2023-06-05T10:00:00",
    author: "山田 太郎",
  },
  {
    id: "announcement-2",
    courseId: "course-123",
    title: "追加の参考資料について",
    content:
      "JavaScriptの学習に役立つ追加の参考資料をアップロードしました。教材セクションをご確認ください。",
    createdAt: "2023-06-10T14:00:00",
    author: "山田 太郎",
  },
];

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
