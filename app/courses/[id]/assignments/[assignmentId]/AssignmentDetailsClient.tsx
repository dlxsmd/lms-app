"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Assignment, ProblemType, Course, User } from "@/app/types";
import CodeEditor, { languageTemplates } from "./CodeEditor";
import { toast, Toast, Toaster } from "react-hot-toast";
import { recordActivity } from "@/app/lib/activity";
import { SupabaseClient } from "@supabase/supabase-js";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

// 日付フォーマット用のヘルパー関数
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "期限未設定";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "無効な日付";
    return date.toLocaleDateString("ja-JP");
  } catch (error) {
    console.error("日付のフォーマットエラー:", error);
    return "無効な日付";
  }
};

// 課題種類の日本語表示用のマッピング
const problemTypeLabels: Record<ProblemType, string> = {
  multiple_choice: "選択問題",
  short_answer: "記述問題",
  essay: "エッセイ",
  file_upload: "ファイル提出",
  code: "コーディング課題",
};

interface TestResult {
  message: string;
  passed: boolean;
}

interface SubmissionContent {
  selected_answers?: Record<string, string>;
  code?: string;
  text?: string;
  file_url?: string;
  language?: string;
  test_results?: TestResult[];
}

// 課題コンテンツ表示コンポーネント
const AssignmentContent = ({
  assignment,
  submitted,
  selectedAnswers,
  handleAnswerSelect,
  codeSubmission,
  setCodeSubmission,
  selectedLanguage,
  setSelectedLanguage,
  testInput,
  setTestInput,
  testOutput,
  handleTestRun,
  isRunning,
  submissionContent,
}: {
  assignment: Assignment;
  submitted: boolean;
  selectedAnswers: Record<string, string>;
  handleAnswerSelect: (questionId: string, optionId: string) => void;
  codeSubmission: string;
  setCodeSubmission: (code: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  testInput: string;
  setTestInput: (input: string) => void;
  testOutput: string;
  handleTestRun: () => void;
  isRunning: boolean;
  submissionContent?: SubmissionContent;
}) => {
  switch (assignment.problem_type) {
    case "multiple_choice":
      return (
        <div className="space-y-4">
          {assignment.content.questions.map((question: any, index: number) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md">
              <p className="font-medium mb-2">
                問題{question.id}. {question.text}
              </p>
              <div className="space-y-2">
                {question.options.map((option: any, optIndex: number) => {
                  const isSelected = selectedAnswers[question.id] === option.id;
                  const isCorrect = option.isCorrect;
                  const showResult = submitted && isSelected;

                  return (
                    <div key={optIndex} className="flex items-center">
                      <input
                        type="radio"
                        id={`q${question.id}-opt${optIndex}`}
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={isSelected}
                        onChange={() =>
                          handleAnswerSelect(question.id, option.id)
                        }
                        className="h-4 w-4 text-indigo-600"
                        disabled={submitted}
                      />
                      <label
                        htmlFor={`q${question.id}-opt${optIndex}`}
                        className={`ml-2 ${
                          showResult
                            ? isCorrect
                              ? "text-green-700"
                              : "text-red-700"
                            : "text-gray-700"
                        }`}
                      >
                        {option.text}
                        {showResult && (
                          <span
                            className={`ml-2 ${
                              isCorrect ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isCorrect ? "✓ 正解" : "× 不正解"}
                          </span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
              {submitted && (
                <div className="mt-3 text-sm">
                  {question.options.find((opt: any) => opt.isCorrect)
                    ?.explanation && (
                    <p className="text-gray-600 mt-2 bg-blue-50 p-2 rounded">
                      <span className="font-medium">解説：</span>
                      {
                        question.options.find((opt: any) => opt.isCorrect)
                          ?.explanation
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
          {submitted && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <p className="font-medium text-lg">
                得点:{" "}
                {Math.round(
                  assignment.content.questions.reduce(
                    (total: number, question: any) => {
                      const selectedAnswer = selectedAnswers[question.id];
                      const selectedOption = question.options.find(
                        (opt: any) => opt.id === selectedAnswer
                      );
                      const isCorrect = selectedOption?.isCorrect;
                      const questionPoints =
                        question.points ||
                        assignment.points_possible /
                          assignment.content.questions.length;
                      return total + (isCorrect ? questionPoints : 0);
                    },
                    0
                  )
                )}{" "}
                / {assignment.points_possible} 点
              </p>
            </div>
          )}
        </div>
      );

    case "short_answer":
      return (
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="font-medium mb-2">{assignment.content.question}</p>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="回答を入力してください"
            disabled={submitted}
          />
        </div>
      );

    case "essay":
      return (
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="font-medium mb-2">{assignment.content.topic}</p>
          <p className="text-gray-600 text-sm mb-4">
            {assignment.content.requirements}
          </p>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={8}
            placeholder="エッセイを入力してください"
            disabled={submitted}
          />
        </div>
      );

    case "file_upload":
      return (
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="font-medium mb-2">提出要件</p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            {assignment.content.requirements.map(
              (req: string, index: number) => (
                <li key={index}>{req}</li>
              )
            )}
          </ul>
          <p className="text-sm text-gray-500">
            許可されているファイル形式:{" "}
            {assignment.content.allowed_extensions.join(", ")}
          </p>
        </div>
      );

    case "code":
      return (
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="mb-4">
            <p className="font-medium mb-2">課題の説明</p>
            <p className="text-gray-600">{assignment.content.description}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プログラミング言語
            </label>
            <select
              className="w-full p-2 border rounded-md bg-white"
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setCodeSubmission(languageTemplates[e.target.value] || "");
              }}
              disabled={submitted}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="csharp">C#</option>
              <option value="ruby">Ruby</option>
              <option value="php">PHP</option>
              <option value="swift">Swift</option>
              <option value="rust">Rust</option>
              <option value="go">Go</option>
              <option value="kotlin">Kotlin</option>
            </select>
          </div>

          {assignment.content.example && (
            <div className="mb-4">
              <p className="font-medium mb-2">入力例</p>
              <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
                <code>{assignment.content.example.input}</code>
              </pre>
              <p className="font-medium mb-2 mt-4">出力例</p>
              <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
                <code>{assignment.content.example.output}</code>
              </pre>
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              コード
            </label>
            <CodeEditor
              language={selectedLanguage}
              initialCode={codeSubmission}
              onChange={(code) => setCodeSubmission(code)}
              readOnly={submitted}
            />
          </div>

          {!submitted && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  テスト入力
                </label>
                <textarea
                  className="w-full p-2 border rounded-md font-mono text-sm"
                  rows={3}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="テストしたい入力を記述してください"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleTestRun}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  disabled={isRunning}
                >
                  {isRunning ? "実行中..." : "テスト実行"}
                </button>
              </div>

              {testOutput && (
                <div>
                  <p className="font-medium mb-2">実行結果:</p>
                  <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
                    <code>{testOutput}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {submitted && assignment.content.solution && (
            <div className="mt-6">
              <p className="font-medium mb-2">解答例</p>
              <CodeEditor
                language={selectedLanguage}
                initialCode={assignment.content.solution}
                readOnly={true}
                onChange={() => {}}
              />
            </div>
          )}

          {submitted && submissionContent?.test_results && (
            <TestResults results={submissionContent.test_results} />
          )}
        </div>
      );

    default:
      return <p>課題の形式が不明です。</p>;
  }
};

// レート制限用のユーティリティ関数を追加
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const executeCode = async (language: string, code: string, input: string) => {
  const JUDGE0_API = "https://judge0-ce.p.rapidapi.com";
  const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2秒待機

  if (!RAPIDAPI_KEY) {
    throw new Error("RapidAPI キーが設定されていません");
  }

  const languageIds: Record<string, number> = {
    python: 71,
    javascript: 63,
    java: 62,
    cpp: 54,
    c: 50,
    csharp: 51,
    ruby: 72,
    php: 68,
    swift: 83,
    rust: 73,
    go: 60,
    kotlin: 78,
  };

  if (!languageIds[language]) {
    throw new Error("未対応の言語です");
  }

  const makeRequest = async (retryCount: number = 0): Promise<any> => {
    try {
      // Base64エンコード
      const base64Code = btoa(unescape(encodeURIComponent(code)));
      const base64Input = btoa(unescape(encodeURIComponent(input)));

      console.log("コード実行リクエスト:", {
        language_id: languageIds[language],
        source_code: base64Code,
        stdin: base64Input,
      });

      // トークンの取得
      const response = await fetch(
        `${JUDGE0_API}/submissions?base64_encoded=true`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
          body: JSON.stringify({
            language_id: languageIds[language],
            source_code: base64Code,
            stdin: base64Input,
          }),
        }
      );

      if (response.status === 429) {
        if (retryCount < MAX_RETRIES) {
          console.log(`レート制限に達しました。${RETRY_DELAY/1000}秒後にリトライします... (${retryCount + 1}/${MAX_RETRIES})`);
          await wait(RETRY_DELAY);
          return makeRequest(retryCount + 1);
        }
        throw new Error("APIのレート制限に達しました。しばらく待ってから再試行してください。");
      }

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      }

      const submissionData = await response.json();
      if (!submissionData || !submissionData.token) {
        throw new Error("トークンの取得に失敗しました");
      }

      const { token } = submissionData;
      console.log("取得したトークン:", token);

      // 結果の取得（ポーリング）
      let result;
      for (let i = 0; i < 10; i++) {
        await wait(1000); // ポーリング間隔を1秒に設定

        const resultResponse = await fetch(
          `${JUDGE0_API}/submissions/${token}?base64_encoded=true`,
          {
            headers: {
              "X-RapidAPI-Key": RAPIDAPI_KEY,
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
          }
        );

        if (resultResponse.status === 429) {
          console.log("結果取得時にレート制限に達しました。待機中...");
          await wait(RETRY_DELAY);
          continue;
        }

        if (!resultResponse.ok) {
          throw new Error(`結果取得エラー: ${resultResponse.status} ${resultResponse.statusText}`);
        }

        try {
          result = await resultResponse.json();
        } catch (e) {
          console.error("JSON解析エラー:", e);
          throw new Error("実行結果の解析に失敗しました");
        }

        if (!result) {
          throw new Error("実行結果が空です");
        }

        console.log("実行状態:", result.status);

        if (result.status?.id > 2) {
          break;
        }
      }

      // Base64デコード
      const decodeBase64 = (str: string | null) => {
        if (!str) return null;
        try {
          return decodeURIComponent(escape(atob(str)));
        } catch (e) {
          console.error("Base64デコードエラー:", e);
          return str;
        }
      };

      if (result.compile_output) {
        const compilationError = decodeBase64(result.compile_output);
        console.log("コンパイルエラー:", compilationError);
        return `コンパイルエラー:\n${compilationError}`;
      }

      if (result.stderr) {
        const runtimeError = decodeBase64(result.stderr);
        console.log("実行時エラー:", runtimeError);
        return `実行エラー:\n${runtimeError}`;
      }

      const output = decodeBase64(result.stdout);
      console.log("実行結果:", output);
      return output || "出力なし";

    } catch (error: any) {
      if (error.message.includes("レート制限") && retryCount < MAX_RETRIES) {
        console.log(`エラーが発生しました。リトライします... (${retryCount + 1}/${MAX_RETRIES})`);
        await wait(RETRY_DELAY);
        return makeRequest(retryCount + 1);
      }
      throw error;
    }
  };

  try {
    return await makeRequest();
  } catch (error: any) {
    console.error("コード実行エラー:", error);
    return `エラー: ${error.message || "不明なエラーが発生しました"}`;
  }
};

// TestResults コンポーネントを作成
const TestResults = ({ results }: { results: TestResult[] }) => (
  <div className="mt-6">
    <h3 className="font-medium text-lg mb-2">テスト結果</h3>
    <div className="bg-gray-50 p-4 rounded-md">
      {results.map((result, index) => (
        <div
          key={index}
          className={`mb-2 ${
            result.passed ? "text-green-600" : "text-red-600"
          }`}
        >
          {result.message}
        </div>
      ))}
    </div>
  </div>
);

// gradeCodeSubmission 関数の戻り値の型を更新
const gradeCodeSubmission = async (
  code: string,
  language: string,
  testCases: { input: string; expected: string }[]
): Promise<{ grade: number; feedback: TestResult[] }> => {
  const results: TestResult[] = [];
  let passedTests = 0;

  console.log("テストケースの実行を開始:", testCases);

  for (const testCase of testCases) {
    try {
      const output = await executeCode(language, code, testCase.input);
      const normalizedOutput = output.trim();
      const normalizedExpected = testCase.expected.trim();

      console.log("テストケース実行結果:", {
        input: testCase.input,
        expected: normalizedExpected,
        actual: normalizedOutput,
      });

      const passed = normalizedOutput === normalizedExpected;
      if (passed) {
        passedTests++;
        results.push({
          message: `✅ テストケース通過: 入力="${testCase.input}", 期待値="${testCase.expected}"`,
          passed: true,
        });
      } else {
        results.push({
          message: `❌ テストケース失敗: 入力="${testCase.input}", 期待値="${testCase.expected}", 実際の出力="${normalizedOutput}"`,
          passed: false,
        });
      }
    } catch (error: any) {
      console.error("テストケース実行エラー:", error);
      results.push({
        message: `❌ テストケース実行エラー: 入力="${testCase.input}" - ${error.message}`,
        passed: false,
      });
    }
  }

  const totalTests = testCases.length;
  const grade = Math.round((passedTests / totalTests) * 100);

  console.log("採点結果:", {
    passedTests,
    totalTests,
    grade,
  });

  return {
    grade,
    feedback: results,
  };
};

// 提出回数を取得する関数
const getSubmissionCount = async (
  assignmentId: string,
  studentId: string,
  supabase: any
) => {
  const { data, error } = await supabase
    .from("submissions")
    .select("submission_number")
    .eq("assignment_id", assignmentId)
    .eq("student_id", studentId)
    .order("submission_number", { ascending: false })
    .limit(1);

  if (error) {
    console.error("提出回数取得エラー:", error);
    return 0;
  }

  return data?.[0]?.submission_number || 0;
};

// 再提出が可能かどうかを判定する関数
const canResubmit = (
  assignment: Assignment,
  submissionCount: number,
  currentGrade?: number | null
): boolean => {
  // 100点を取得している場合は再提出不可
  if (currentGrade === assignment.points_possible) return false;

  // 再提出が許可されていない場合は不可
  if (!assignment.allow_resubmission) return false;

  // 最大試行回数に達している場合は不可
  if (assignment.max_attempts && submissionCount >= assignment.max_attempts)
    return false;

  return true;
};

// 提出が可能かどうかを判定する関数
const canSubmit = (
  assignment: Assignment,
  submissionCount: number,
  isResubmission: boolean,
  currentGrade?: number | null
): boolean => {
  if (isResubmission) {
    return canResubmit(assignment, submissionCount, currentGrade);
  }
  return !assignment.max_attempts || submissionCount < assignment.max_attempts;
};

// 選択問題の採点を行う関数
const calculateMultipleChoiceGrade = (
  selectedAnswers: Record<string, string>,
  questions: any[],
  totalPoints: number
): number => {
  console.log("選択された回答:", selectedAnswers);
  console.log("問題データ:", questions);
  console.log("配点:", totalPoints);

  let correctCount = 0;
  questions.forEach((question) => {
    const selectedOptionId = selectedAnswers[question.id];
    const correctOption = question.options.find((opt: any) => opt.isCorrect);
    if (correctOption && selectedOptionId === correctOption.id) {
      correctCount++;
    }
  });

  const pointsPerQuestion = totalPoints / questions.length;
  const grade = Math.round(correctCount * pointsPerQuestion);

  console.log("正解数:", correctCount);
  console.log("問題数:", questions.length);
  console.log("1問あたりの配点:", pointsPerQuestion);
  console.log("計算された得点:", grade);

  return grade;
};

interface AssignmentDetailsClientProps {
  id: string;
  assignmentId: string;
}

// カスタム成功通知コンポーネント
const SuccessToast = ({ t, message }: { t: Toast; message: string }) => {
  return (
    <div
      className={`${
        t.visible
          ? "animate-[slideIn_0.3s_ease-out]"
          : "animate-[slideOut_0.3s_ease-in]"
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <CheckCircleIcon className="h-10 w-10 text-green-500 animate-bounce" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">提出完了！</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

// カスタムエラー通知コンポーネント
const ErrorToast = ({ t, message }: { t: Toast; message: string }) => {
  return (
    <div
      className={`${
        t.visible
          ? "animate-[slideIn_0.3s_ease-out]"
          : "animate-[slideOut_0.3s_ease-in]"
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <XCircleIcon className="h-10 w-10 text-red-500 animate-pulse" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              エラーが発生しました
            </p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default function AssignmentDetailsClient({
  id,
  assignmentId,
}: AssignmentDetailsClientProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionText, setSubmissionText] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [codeSubmission, setCodeSubmission] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [submissionCount, setSubmissionCount] = useState<number>(0);
  const [currentGrade, setCurrentGrade] = useState<number | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState<SubmissionContent>(
    {
      selected_answers: {},
      code: "",
      text: "",
      file_url: "",
      language: "python",
      test_results: [],
    }
  );

  // 言語が変更されたときのテンプレートコードの設定
  useEffect(() => {
    if (assignment?.problem_type === "code" && !submitted) {
      setCodeSubmission(languageTemplates[selectedLanguage] || "");
    }
  }, [selectedLanguage, assignment, submitted]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // ユーザー情報の取得
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("ユーザーが見つかりません");

        // ユーザーの詳細情報を取得
        const { data: userData, error: userDataError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (userDataError) throw userDataError;
        if (!userData) throw new Error("ユーザー情報が見つかりません");

        setCurrentUser(userData);

        // 課題データの取得
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("assignments")
          .select(
            `
            *,
            courses (
              id,
              title,
              description,
              teacher_id,
              cover_image_url,
              is_active,
              created_at,
              updated_at
            )
          `
          )
          .eq("id", assignmentId)
          .single();

        if (assignmentError) throw assignmentError;
        if (!assignmentData) throw new Error("課題が見つかりません");

        setAssignment(assignmentData);
        setCourse(assignmentData.courses);

        // 既存の提出物があるか確認
        const { data: submissionData, error: submissionError } = await supabase
          .from("submissions")
          .select("*")
          .eq("assignment_id", assignmentId)
          .eq("student_id", userData.id)
          .order("submitted_at", { ascending: false })
          .single();

        if (submissionError && submissionError.code !== "PGRST116") {
          throw submissionError;
        }

        if (submissionData) {
          setSubmitted(true);
          setCurrentGrade(submissionData.grade);
          setSubmissionCount(submissionData.submission_number);

          if (submissionData.submission_content) {
            if (assignmentData.problem_type === "multiple_choice") {
              // 保存された回答を復元
              const savedAnswers =
                submissionData.submission_content.selected_answers || {};
              console.log("保存された回答を復元:", savedAnswers);
              setSelectedAnswers(savedAnswers);
            } else if (assignmentData.problem_type === "code") {
              const code = submissionData.submission_content.code;
              const language =
                submissionData.submission_content.language || "python";
              setCodeSubmission(code || languageTemplates[language]);
              setSelectedLanguage(language);
            } else {
              setSubmissionText(submissionData.submission_content.text || "");
            }
          }
        } else {
          setSubmissionCount(0);
          if (assignmentData.problem_type === "code") {
            setCodeSubmission(languageTemplates[selectedLanguage]);
          }
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
        toast.error("データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [assignmentId, supabase]);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const showSuccessToast = (grade: number | null) => {
    const message =
      grade !== null
        ? `得点: ${grade}/${assignment?.points_possible || 0}点`
        : "採点結果は後ほど通知されます";

    toast.custom(
      (t) => (
        <SuccessToast
          t={t}
          message={`課題が正常に提出されました！${message}`}
        />
      ),
      {
        duration: 5000,
        position: "top-center",
        id: "success-toast",
      }
    );
  };

  const showErrorToast = (message: string) => {
    toast.custom((t) => <ErrorToast t={t} message={message} />, {
      duration: 5000,
      position: "top-center",
      id: "error-toast",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!currentUser || !course || !assignment) {
        setError(
          "ユーザーまたはコース情報が取得できません。ページを再読み込みしてください。"
        );
        throw new Error("ユーザーまたはコース情報が取得できません");
      }

      let submissionData: SubmissionContent = {
        selected_answers: {},
        code: "",
        text: "",
        file_url: "",
        language: "python",
        test_results: [],
      };
      let finalGrade = null;
      switch (assignment.problem_type) {
        case "multiple_choice":
          if (Object.keys(selectedAnswers).length === 0) {
            setError("少なくとも1つの回答を選択してください。");
            throw new Error("回答を選択してください");
          }
          if (
            Object.keys(selectedAnswers).length <
            assignment.content.questions.length
          ) {
            setError(
              `すべての問題に回答してください。（${
                Object.keys(selectedAnswers).length
              }/${assignment.content.questions.length}問回答済み）`
            );
            throw new Error("すべての問題に回答してください");
          }

          submissionData = {
            ...submissionData,
            selected_answers: selectedAnswers,
          };
          break;
        case "code":
          const trimmedCode = codeSubmission.trim();
          if (!trimmedCode) {
            setError("コードが入力されていません。");
            throw new Error("コードを入力してください");
          }
          if (trimmedCode === languageTemplates[selectedLanguage].trim()) {
            setError(
              "テンプレートコードをそのまま提出することはできません。コードを編集してください。"
            );
            throw new Error("テンプレートコードがそのまま提出されています");
          }

          if (assignment.content.test_cases) {
            console.log("自動採点を開始します");
            const { grade, feedback } = await gradeCodeSubmission(
              trimmedCode,
              selectedLanguage,
              assignment.content.test_cases
            );

            finalGrade = grade;
            submissionData = {
              ...submissionData,
              code: trimmedCode,
              language: selectedLanguage,
              test_results: feedback,
            };

            console.log("自動採点完了:", {
              grade: finalGrade,
              feedback,
            });
          } else {
            submissionData = {
              ...submissionData,
              code: trimmedCode,
              language: selectedLanguage,
            };
          }
          break;
        case "file_upload":
          if (!file) {
            setError("ファイルが選択されていません。");
            throw new Error("ファイルを選択してください");
          }
          // ファイル拡張子のチェック
          const fileExt = file.name.split(".").pop()?.toLowerCase();
          if (!assignment.content.allowed_extensions.includes(`.${fileExt}`)) {
            setError(
              `このファイル形式（.${fileExt}）は許可されていません。許可されている形式: ${assignment.content.allowed_extensions.join(
                ", "
              )}`
            );
            throw new Error("不正なファイル形式です");
          }
          // ファイルのアップロード処理
          const filePath = `submissions/${assignmentId}/${
            currentUser.id
          }/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("assignments")
            .upload(filePath, file);

          if (uploadError) {
            console.error("ファイルのアップロードに失敗しました:", uploadError);
            throw new Error("ファイルのアップロードに失敗しました");
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("assignments").getPublicUrl(filePath);

          submissionData = {
            ...submissionData,
            file_url: publicUrl,
          };
          break;
        case "short_answer":
        case "essay":
          if (!submissionText.trim()) {
            setError("回答を入力してください。");
            throw new Error("回答を入力してください");
          }
          if (submissionText.trim().length < 10) {
            setError("回答が短すぎます。もう少し詳しく記述してください。");
            throw new Error("回答が短すぎます");
          }
          submissionData = {
            ...submissionData,
            text: submissionText,
          };
          break;
        default:
          setError("不正な問題タイプです。");
          throw new Error("不正な問題タイプです");
      }

      // 提出回数のチェック
      if (!canSubmit(assignment, submissionCount, false, currentGrade)) {
        setError(
          `これ以上提出できません。（提出回数: ${submissionCount}/${
            assignment.max_attempts || "∞"
          }）`
        );
        throw new Error("これ以上提出できません");
      }

      // 提出処理
      const { data: submission, error: submissionError } = await supabase
        .from("submissions")
        .upsert(
          {
            assignment_id: assignmentId,
            student_id: currentUser.id,
            submission_content: submissionData,
            submitted_at: new Date().toISOString(),
            submission_number: submissionCount + 1,
            grade: finalGrade,
            graded_at: finalGrade !== null ? new Date().toISOString() : null,
            graded_by: null,
            feedback: null,
          },
          {
            onConflict: "assignment_id,student_id",
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (submissionError) {
        console.error("提出エラー:", submissionError);
        console.error("提出しようとしたデータ:", {
          submission_content: submissionData,
          grade: finalGrade,
        });
        throw new Error(
          `提出に失敗しました: ${submissionError.message || "不明なエラー"}`
        );
      }

      // アクティビティの記録
      await recordActivity(
        supabase as SupabaseClient,
        currentUser.id,
        "submission",
        {
          course_id: course.id,
          course_title: course.title,
          assignment_id: assignmentId,
          assignment_title: assignment.title,
          submission_id: submission.id,
        }
      );

      // 採点結果のアクティビティを記録
      if (finalGrade !== null) {
        await recordActivity(
          supabase as SupabaseClient,
          currentUser.id,
          "grade_received",
          {
            course_id: course.id,
            course_title: course.title,
            assignment_id: assignmentId,
            assignment_title: assignment.title,
            grade: finalGrade,
            submission_id: submission.id,
          }
        );
      }

      setSubmitting(false);
      setSubmitted(true);
      setSubmissionCount(submissionCount + 1);
      if (finalGrade !== null) {
        setCurrentGrade(finalGrade);
      }
      showSuccessToast(finalGrade);
      router.refresh();
    } catch (error: any) {
      console.error("課題提出中にエラーが発生しました:", error);
      setSubmitting(false);
      if (!error.message.includes("これ以上提出できません")) {
        showErrorToast(error.message || "課題の提出に失敗しました");
      }
    }
  };

  const handleTestRun = async () => {
    setIsRunning(true);
    try {
      if (!codeSubmission.trim()) {
        setTestOutput("エラー: コードが入力されていません。");
        return;
      }

      const output = await executeCode(
        selectedLanguage,
        codeSubmission,
        testInput
      );

      if (!output) {
        setTestOutput("エラー: 実行結果が空です。");
        return;
      }

      setTestOutput(output);
    } catch (error: any) {
      console.error("テスト実行エラー:", error);
      setTestOutput(
        `エラー: ${
          error?.message || error?.toString() || "不明なエラーが発生しました"
        }`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleResubmit = () => {
    setSubmitted(false);
    setSubmissionText("");
    setSelectedAnswers({});
    setFile(null);
    setCodeSubmission("");
    setTestInput("");
    setTestOutput("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-red-600">課題が見つかりませんでした。</p>
            <Link
              href={`/courses/${id}/manage`}
              className="mt-4 inline-block text-indigo-600 hover:underline"
            >
              コース管理ページに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: "white",
            color: "#363636",
          },
        }}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/courses/${id}`}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← コースページに戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm">
                  {problemTypeLabels[assignment.problem_type]}
                </span>
                <h1 className="text-2xl font-bold text-gray-900">
                  {assignment.title}
                </h1>
              </div>
              <p className="text-gray-600">{assignment.description}</p>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span>提出期限: {formatDate(assignment.due_date)}</span>
                <span className="mx-2">•</span>
                <span>配点: {assignment.points_possible}点</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">課題内容</h2>
                <div className="text-sm text-gray-600">
                  {assignment.max_attempts ? (
                    <div
                      className={`${
                        submissionCount >= assignment.max_attempts
                          ? "text-red-600 font-semibold"
                          : ""
                      }`}
                    >
                      提出回数: {submissionCount} / {assignment.max_attempts}
                      {submissionCount >= assignment.max_attempts && (
                        <span className="ml-2">（制限到達）</span>
                      )}
                    </div>
                  ) : (
                    assignment.allow_resubmission && (
                      <div>提出回数: {submissionCount} / 無制限</div>
                    )
                  )}
                </div>
              </div>

              <AssignmentContent
                assignment={assignment}
                submitted={submitted}
                selectedAnswers={selectedAnswers}
                handleAnswerSelect={handleAnswerSelect}
                codeSubmission={codeSubmission}
                setCodeSubmission={setCodeSubmission}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                testInput={testInput}
                setTestInput={setTestInput}
                testOutput={testOutput}
                handleTestRun={handleTestRun}
                isRunning={isRunning}
                submissionContent={submissionContent}
              />

              {!submitted ? (
                <form onSubmit={handleSubmit} className="mt-6">
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600">{error}</p>
                      {assignment.problem_type === "multiple_choice" && (
                        <p className="text-sm text-red-500 mt-2">
                          未回答の問題があります。すべての問題に回答してください。
                        </p>
                      )}
                    </div>
                  )}

                  {(assignment.problem_type === "short_answer" ||
                    assignment.problem_type === "essay" ||
                    assignment.problem_type === "code") && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        回答
                      </label>
                      <textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        rows={6}
                        required
                      />
                    </div>
                  )}

                  {assignment.problem_type === "file_upload" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ファイルをアップロード
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100"
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors ${
                      submitting ||
                      !canSubmit(
                        assignment,
                        submissionCount,
                        false,
                        currentGrade
                      )
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      submitting ||
                      !canSubmit(
                        assignment,
                        submissionCount,
                        false,
                        currentGrade
                      )
                    }
                  >
                    {submitting ? "提出中..." : "課題を提出"}
                  </button>
                </form>
              ) : (
                <div className="mt-6">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <p className="text-green-800">この課題は提出済みです。</p>
                    {currentGrade !== null && (
                      <p className="text-gray-600 mt-2">
                        現在の得点: {currentGrade} /{" "}
                        {assignment.points_possible}点
                      </p>
                    )}
                    {canResubmit(assignment, submissionCount, currentGrade) ? (
                      <button
                        onClick={handleResubmit}
                        className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        再提出する
                      </button>
                    ) : (
                      <>
                        {currentGrade === assignment.points_possible ? (
                          <p className="mt-2 text-green-600">
                            満点を獲得しているため、再提出は不要です。
                          </p>
                        ) : assignment.max_attempts &&
                          submissionCount >= assignment.max_attempts ? (
                          <p className="mt-2 text-red-600">
                            提出回数の制限（{assignment.max_attempts}
                            回）に達しています。
                          </p>
                        ) : (
                          <p className="mt-2 text-gray-600">
                            この課題は再提出できません。
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
