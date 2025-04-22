"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../../../components/Layout/Navbar";
import { getAssignmentById } from "../../../../../lib/assignments";
import {
  createQuizQuestion,
  getQuizQuestionsByAssignmentId,
  deleteQuizQuestion,
} from "../../../../../lib/quizzes";
import { getCurrentUser } from "../../../../../lib/auth";

interface QuizEditorClientProps {
  params: {
    id: string;
    assignmentId: string;
  };
}

interface Option {
  text: string;
  isCorrect: boolean;
}

export default function QuizEditorClient({ params }: QuizEditorClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionText, setQuestionText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // ユーザー情報を取得
        const user = await getCurrentUser();
        setCurrentUser(user);

        // 教師でない場合はリダイレクト
        if (user?.role !== "teacher") {
          alert("この機能を使用するには教師権限が必要です");
          router.push(
            `/courses/${params.id}/assignments/${params.assignmentId}`
          );
          return;
        }

        // 課題データを取得
        const assignmentData = await getAssignmentById(params.assignmentId);
        setAssignment(assignmentData);

        // 既存の選択問題を取得
        const existingQuestions = await getQuizQuestionsByAssignmentId(
          params.assignmentId
        );
        setQuestions(existingQuestions);
      } catch (error) {
        console.error("データ取得エラー:", error);
        setError("データの読み込み中にエラーが発生しました。");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [params.id, params.assignmentId, router]);

  const handleOptionChange = (
    index: number,
    field: keyof Option,
    value: string | boolean
  ) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      setError("問題文を入力してください。");
      return;
    }

    if (options.some((opt) => !opt.text.trim())) {
      setError("すべての選択肢を入力してください。");
      return;
    }

    if (!options.some((opt) => opt.isCorrect)) {
      setError("正解を少なくとも1つ選択してください。");
      return;
    }

    try {
      const newQuestion = await createQuizQuestion({
        assignmentId: params.assignmentId,
        questionText: questionText,
        explanation: explanation.trim() || undefined,
        options: options.map((opt) => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      });

      setQuestions([...questions, newQuestion]);
      setQuestionText("");
      setExplanation("");
      setOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
      setError(null);
    } catch (err) {
      setError("問題の作成中にエラーが発生しました。");
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("この問題を削除してもよろしいですか？")) {
      return;
    }

    try {
      await deleteQuizQuestion(questionId);
      setQuestions(questions.filter((q) => q.id !== questionId));
      alert("問題が削除されました");
    } catch (error) {
      console.error("削除エラー:", error);
      alert("問題の削除中にエラーが発生しました");
    }
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Link
              href={`/courses/${params.id}/manage`}
              className="mt-4 inline-block text-indigo-600 hover:underline"
            >
              コース管理ページに戻る
            </Link>
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
              href={`/courses/${params.id}/manage`}
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
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/courses/${params.id}/assignments/${params.assignmentId}`}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← 課題詳細に戻る
          </Link>
        </div>

        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-2">{assignment.title}</h1>
          <p className="text-gray-600 mb-4">{assignment.description}</p>
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-6">選択問題の管理</h2>

            {/* 既存の問題一覧 */}
            {questions.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">登録済みの問題</h3>
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-800">
                          問題 {index + 1}
                        </h4>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          削除
                        </button>
                      </div>
                      <p className="my-2">{question.question_text}</p>
                      <ul className="ml-5 list-disc">
                        {question.options.map((option: any) => (
                          <li
                            key={option.id}
                            className={
                              option.is_correct
                                ? "text-green-600 font-medium"
                                : ""
                            }
                          >
                            {option.option_text} {option.is_correct && "(正解)"}
                          </li>
                        ))}
                      </ul>
                      {question.explanation && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>解説:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mb-6 text-gray-600">
                まだ問題が登録されていません。
              </p>
            )}

            {/* 問題作成フォーム */}
            <h3 className="text-lg font-medium mb-4">新しい問題を作成</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-medium">問題文</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="問題文を入力してください"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block mb-2 font-medium">選択肢</label>
                <p className="text-sm text-gray-500 mb-2">
                  ラジオボタンをクリックして正解を選択してください
                </p>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={option.isCorrect}
                      onChange={(e) =>
                        handleOptionChange(index, "isCorrect", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(index, "text", e.target.value)
                      }
                      className="flex-1 p-2 border rounded"
                      placeholder={`選択肢 ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="ml-2 text-red-600"
                    >
                      削除
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 text-indigo-600 hover:text-indigo-800"
                >
                  + 選択肢を追加
                </button>
              </div>

              <div>
                <label className="block mb-2 font-medium">解説 (任意)</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="解説を入力してください（任意）"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                問題を作成
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
