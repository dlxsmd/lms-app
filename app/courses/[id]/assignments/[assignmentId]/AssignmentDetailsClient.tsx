"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../../../components/Layout/Navbar";
import { mockAssignments, mockQuizQuestions } from "@/app/mockData";

// 選択問題の型定義
interface MultipleChoiceQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: number; // 正解の選択肢のインデックス（0始まり）
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function MarkdownContent({ content }: { content: string }) {
  // 非常に簡易的なMarkdownレンダラー
  const renderMarkdown = (text: string) => {
    // 見出し
    text = text.replace(
      /## (.*)/g,
      '<h2 class="text-xl font-bold my-3">$1</h2>'
    );

    // リスト
    text = text.replace(
      /^\d+\. (.*)/gm,
      '<li class="ml-6 list-decimal">$1</li>'
    );
    text = text.replace(/^   - (.*)/gm, '<li class="ml-10 list-disc">$1</li>');

    // 段落
    text = text.replace(/\n\n/g, '</p><p class="my-2">');

    return `<p class="my-2">${text}</p>`;
  };

  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}

// 選択問題コンポーネント
function MultipleChoiceQuestionComponent({
  question,
  onAnswerSelected,
  selectedAnswer,
}: {
  question: MultipleChoiceQuestion;
  onAnswerSelected: (questionId: string, answerIndex: number) => void;
  selectedAnswer: number | null;
}) {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-3">{question.question}</h3>
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center">
            <input
              type="radio"
              id={`question-${question.id}-option-${index}`}
              name={`question-${question.id}`}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              checked={selectedAnswer === index}
              onChange={() => onAnswerSelected(question.id, index)}
            />
            <label
              htmlFor={`question-${question.id}-option-${index}`}
              className="ml-3 block text-sm font-medium text-gray-700"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AssignmentDetailsClientProps {
  id: string;
  assignmentId: string;
}

export default function AssignmentDetailsClient({
  id,
  assignmentId,
}: AssignmentDetailsClientProps) {
  const [assignment, setAssignment] = useState<any>(null);
  const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionText, setSubmissionText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>(
    {}
  );
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>({
    id: "user-1",
    role: "student",
  });
  const router = useRouter();

  useEffect(() => {
    // モックデータを使用
    function loadData() {
      setLoading(true);
      try {
        // モックの課題データを取得
        const foundAssignment = mockAssignments.find(
          (a) => a.id === assignmentId
        );

        if (foundAssignment) {
          // 見つかった課題を整形して使用
          setAssignment({
            ...foundAssignment,
            content: foundAssignment.description,
            due_date: foundAssignment.dueDate,
            max_score: foundAssignment.totalPoints,
          });

          // 課題に関連するクイズ問題を取得
          const quizData = mockQuizQuestions.filter(
            (q) => q.assignmentId === assignmentId
          );

          // フォーマット変換
          const formattedQuestions = quizData.map((q) => ({
            id: q.id,
            question: q.text,
            options: q.options.map((opt) => opt.text),
            // 教師の場合は正解も表示
            ...(currentUser?.role === "teacher" && {
              correctAnswer: q.correctOptionId - 1, // 0-indexedに変換
            }),
          }));

          setQuestions(formattedQuestions);

          // 選択問題の初期状態を設定
          const initialAnswers: Record<string, number | null> = {};
          formattedQuestions.forEach((q) => {
            initialAnswers[q.id] = null;
          });
          setQuizAnswers(initialAnswers);
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [assignmentId, currentUser?.role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
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
        <Navbar />
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

  const handleAnswerSelected = (questionId: string, answerIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const calculateQuizScore = () => {
    if (!questions.length) return 0;

    let correct = 0;
    questions.forEach((q) => {
      const selectedAnswer = quizAnswers[q.id];
      const questionData = mockQuizQuestions.find(
        (question) => question.id === q.id
      );

      // questionDataが存在する場合のみcorrectOptionIdにアクセス
      const correctAnswer = questionData
        ? questionData.correctOptionId - 1
        : undefined; // 0-indexedに変換

      if (
        selectedAnswer !== null &&
        correctAnswer !== undefined &&
        selectedAnswer === correctAnswer
      ) {
        correct++;
      }
    });

    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert("ログインしてください");
      return;
    }

    try {
      // 未回答の問題があるか確認
      const unansweredQuestions = Object.entries(quizAnswers).filter(
        ([_, answer]) => answer === null
      );
      if (unansweredQuestions.length > 0 && questions.length > 0) {
        if (
          !confirm(
            `${unansweredQuestions.length}問未回答の問題があります。このまま提出しますか？`
          )
        ) {
          return;
        }
      }

      // クイズの回答をフィルタリング (null値を除外)
      const filteredAnswers: Record<string, number> = {};
      Object.entries(quizAnswers).forEach(([key, value]) => {
        if (value !== null) {
          filteredAnswers[key] = value;
        }
      });

      // モックデータ環境なのでAPIコールは行わない
      console.log("モック環境: クイズ回答を提出:", filteredAnswers);
      console.log("提出テキスト:", submissionText);
      console.log("提出ファイル:", file);

      // 採点
      const score = calculateQuizScore();
      setQuizScore(score);

      // 提出成功時の処理
      setSubmitted(true);
      setTimeout(() => {
        alert(
          `課題が提出されました！${
            questions.length > 0 ? `選択問題の得点: ${score}点` : ""
          }`
        );
      }, 100);
    } catch (error) {
      console.error("提出エラー:", error);
      alert("課題の提出中にエラーが発生しました。");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const hasMultipleChoiceQuestions = questions.length > 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/courses/${id}/manage`}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← コース管理に戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {assignment.title}
              </h1>
              <p className="text-gray-600">{assignment.description}</p>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span>提出期限: {formatDate(assignment.dueDate)}</span>
                <span className="mx-2">•</span>
                <span>配点: {assignment.totalPoints}点</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">課題内容</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <MarkdownContent content={assignment.description} />
              </div>
            </div>
          </div>
        </div>

        {!submitted ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              {hasMultipleChoiceQuestions && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">選択問題</h2>
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <MultipleChoiceQuestionComponent
                        key={question.id}
                        question={question}
                        onAnswerSelected={handleAnswerSelected}
                        selectedAnswer={quizAnswers[question.id]}
                      />
                    ))}
                  </div>
                </div>
              )}

              <h2 className="text-xl font-semibold mb-4">課題提出</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="submission-text"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    提出コメント
                  </label>
                  <textarea
                    id="submission-text"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="提出する課題についてのコメントを入力してください"
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="submission-file"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    ファイルをアップロード
                  </label>
                  <input
                    type="file"
                    id="submission-file"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    onChange={handleFileChange}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    ZIP、PDF、JPG、PNGファイル（最大20MB）
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    課題を提出する
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="mb-4 text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">提出完了</h2>
              <p className="text-gray-600 mb-4">
                課題が正常に提出されました。教員の評価をお待ちください。
              </p>

              {hasMultipleChoiceQuestions && quizScore !== null && (
                <div className="mt-4 mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">
                    選択問題の結果
                  </h3>
                  <p className="text-blue-800 text-2xl font-bold">
                    {quizScore}点
                  </p>
                  <p className="text-sm text-blue-600">
                    {questions.length}問中
                    {Math.round((quizScore / 100) * questions.length)}問正解
                  </p>
                </div>
              )}

              <div className="mt-4">
                <Link
                  href={`/courses/${id}/manage`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  コースページに戻る
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
