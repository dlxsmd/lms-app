"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Assignment, ProblemType } from "@/app/types";
import CodeEditor, { languageTemplates } from "./CodeEditor";

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
        </div>
      );

    default:
      return <p>課題の形式が不明です。</p>;
  }
};

// コード実行用のヘルパー関数
const executeCode = async (language: string, code: string, input: string) => {
  const JUDGE0_API = "https://judge0-ce.p.rapidapi.com";
  const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;

  const languageIds: Record<string, number> = {
    python: 71, // Python 3
    javascript: 63, // JavaScript Node.js
    java: 62, // Java
    cpp: 54, // C++
    c: 50, // C
    csharp: 51, // C#
    ruby: 72, // Ruby
    php: 68, // PHP
    swift: 83, // Swift
    rust: 73, // Rust
    go: 60, // Go
    kotlin: 78, // Kotlin
  };

  if (!languageIds[language]) {
    throw new Error("未対応の言語です");
  }

  try {
    // Base64エンコード
    const base64Code = btoa(unescape(encodeURIComponent(code)));
    const base64Input = btoa(unescape(encodeURIComponent(input)));

    // トークンの取得
    const response = await fetch(
      `${JUDGE0_API}/submissions?base64_encoded=true`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": RAPIDAPI_KEY || "",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          language_id: languageIds[language],
          source_code: base64Code,
          stdin: base64Input,
        }),
      }
    );

    const { token } = await response.json();

    // 結果の取得（ポーリング）
    let result;
    for (let i = 0; i < 10; i++) {
      const resultResponse = await fetch(
        `${JUDGE0_API}/submissions/${token}?base64_encoded=true`,
        {
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY || "",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      result = await resultResponse.json();

      if (result.status?.id > 2) {
        break;
      }

      // 1秒待機
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Base64デコード
    const decodeBase64 = (str: string | null) => {
      if (!str) return null;
      try {
        return decodeURIComponent(escape(atob(str)));
      } catch (e) {
        return str;
      }
    };

    if (result.compile_output) {
      return `コンパイルエラー:\n${decodeBase64(result.compile_output)}`;
    }

    if (result.stderr) {
      return `実行エラー:\n${decodeBase64(result.stderr)}`;
    }

    return decodeBase64(result.stdout) || "出力なし";
  } catch (error: any) {
    console.error("コード実行エラー:", error);
    return `エラー: ${error.message}`;
  }
};

interface AssignmentDetailsClientProps {
  id: string;
  assignmentId: string;
}

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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [codeSubmission, setCodeSubmission] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

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
        setCurrentUser(user);

        // 課題データの取得
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("assignments")
          .select(
            `
            *,
            courses (
              id,
              title
            )
          `
          )
          .eq("id", assignmentId)
          .single();

        if (assignmentError) throw assignmentError;
        if (assignmentData) {
          setAssignment(assignmentData);

          // 既存の提出物があるか確認
          if (user) {
            const { data: submissionData } = await supabase
              .from("submissions")
              .select("*")
              .eq("assignment_id", assignmentId)
              .eq("student_id", user.id)
              .single();

            if (submissionData) {
              setSubmitted(true);
              if (submissionData.submission_content) {
                if (assignmentData.problem_type === "multiple_choice") {
                  setSelectedAnswers(
                    submissionData.submission_content.answers || {}
                  );
                } else if (assignmentData.problem_type === "code") {
                  setCodeSubmission(
                    submissionData.submission_content.code || ""
                  );
                  setSelectedLanguage(
                    submissionData.submission_content.language || "python"
                  );
                } else {
                  setSubmissionText(
                    submissionData.submission_content.text || ""
                  );
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [assignmentId, supabase]);

  // 提出状態が変更されたときに再度データを読み込む
  useEffect(() => {
    if (submitted && currentUser) {
      const loadSubmission = async () => {
        try {
          const { data: submissionData } = await supabase
            .from("submissions")
            .select("*")
            .eq("assignment_id", assignmentId)
            .eq("student_id", currentUser.id)
            .single();

          if (submissionData?.submission_content) {
            if (assignment?.problem_type === "multiple_choice") {
              setSelectedAnswers(
                submissionData.submission_content.answers || {}
              );
            } else if (assignment?.problem_type === "code") {
              setCodeSubmission(submissionData.submission_content.code || "");
              setSelectedLanguage(
                submissionData.submission_content.language || "python"
              );
            } else {
              setSubmissionText(submissionData.submission_content.text || "");
            }
          }
        } catch (error) {
          console.error("提出データの読み込みエラー:", error);
        }
      };

      loadSubmission();
    }
  }, [
    submitted,
    currentUser,
    assignmentId,
    supabase,
    assignment?.problem_type,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !assignment) {
      alert("ログインしてください");
      return;
    }

    try {
      let submissionContent: any = {};

      // 問題タイプに応じて提出内容を構築
      switch (assignment.problem_type) {
        case "multiple_choice":
          submissionContent = {
            answers: selectedAnswers,
          };
          break;
        case "code":
          submissionContent = {
            code: codeSubmission,
          };
          break;
        case "file_upload":
          // ファイルのアップロード処理
          let fileUrl = null;
          if (file) {
            const fileExt = file.name.split(".").pop();
            const fileName = `${assignmentId}/${
              currentUser.id
            }/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
              .from("submissions")
              .upload(fileName, file);

            if (uploadError) throw uploadError;
            fileUrl = fileName;
          }
          submissionContent = { file_url: fileUrl };
          break;
        default:
          submissionContent = { text: submissionText };
      }

      // 提出データの保存
      const { error: submissionError } = await supabase
        .from("submissions")
        .insert({
          assignment_id: assignmentId,
          student_id: currentUser.id,
          submission_content: submissionContent,
          submitted_at: new Date().toISOString(),
        });

      if (submissionError) throw submissionError;

      setSubmitted(true);
      alert("課題が提出されました！");
    } catch (error) {
      console.error("提出エラー:", error);
      alert("課題の提出中にエラーが発生しました。");
    }
  };

  const handleTestRun = async () => {
    setIsRunning(true);
    try {
      const output = await executeCode(
        selectedLanguage,
        codeSubmission,
        testInput
      );
      setTestOutput(output);
    } catch (error: any) {
      setTestOutput(`エラー: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
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
              <h2 className="text-xl font-semibold mb-4">課題内容</h2>
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
              />

              {!submitted ? (
                <form onSubmit={handleSubmit} className="mt-6">
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
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    課題を提出
                  </button>
                </form>
              ) : (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-800">この課題は既に提出済みです。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
