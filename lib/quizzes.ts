import { supabase } from "./supabase";

// 課題に紐づく全ての問題を取得
export async function getQuizQuestionsByAssignmentId(assignmentId: string) {
  const { data: questions, error: questionsError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .order("order_index");

  if (questionsError) {
    console.error("問題の取得に失敗しました:", questionsError);
    return [];
  }

  // 各問題の選択肢を取得
  for (const question of questions) {
    const { data: options, error: optionsError } = await supabase
      .from("quiz_options")
      .select("*")
      .eq("question_id", question.id)
      .order("order_index");

    if (optionsError) {
      console.error("選択肢の取得に失敗しました:", optionsError);
      question.options = [];
    } else {
      question.options = options;
    }
  }

  return questions;
}

// 新しい問題を作成
export async function createQuizQuestion(questionData: {
  assignmentId: string;
  questionText: string;
  explanation?: string;
  orderIndex?: number;
  options: { text: string; isCorrect: boolean }[];
}) {
  const { data: question, error: questionError } = await supabase
    .from("quiz_questions")
    .insert([
      {
        assignment_id: questionData.assignmentId,
        question_text: questionData.questionText,
        explanation: questionData.explanation || "",
        order_index: questionData.orderIndex || 0,
      },
    ])
    .select()
    .single();

  if (questionError) {
    console.error("問題の作成に失敗しました:", questionError);
    return null;
  }

  // 選択肢を追加
  if (questionData.options && questionData.options.length > 0) {
    const optionsToInsert = questionData.options.map((opt, index) => ({
      question_id: question.id,
      option_text: opt.text,
      is_correct: opt.isCorrect || false,
      order_index: index,
    }));

    const { error: optionsError } = await supabase
      .from("quiz_options")
      .insert(optionsToInsert);

    if (optionsError) {
      console.error("選択肢の作成に失敗しました:", optionsError);
    }
  }

  return question;
}

// 問題を更新
export async function updateQuizQuestion(
  questionId: string,
  updates: {
    questionText?: string;
    explanation?: string;
    orderIndex?: number;
  }
) {
  const { data, error } = await supabase
    .from("quiz_questions")
    .update({
      question_text: updates.questionText,
      explanation: updates.explanation,
      order_index: updates.orderIndex,
    })
    .eq("id", questionId)
    .select()
    .single();

  if (error) {
    console.error("問題の更新に失敗しました:", error);
    return null;
  }

  return data;
}

// 問題を削除
export async function deleteQuizQuestion(questionId: string) {
  // Note: 選択肢は CASCADE 設定で自動的に削除されます
  const { error } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", questionId);

  if (error) {
    console.error("問題の削除に失敗しました:", error);
    return false;
  }

  return true;
}

// 学生の解答を保存
export async function submitQuizAnswers(
  assignmentId: string,
  studentId: string,
  answers: Record<string, number>
) {
  const { data, error } = await supabase
    .from("quiz_submissions")
    .insert({
      assignment_id: assignmentId,
      student_id: studentId,
      answers: answers,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("解答の提出に失敗しました:", error);
    return null;
  }

  return data;
}

// 学生の解答を採点
export async function gradeQuizSubmission(submissionId: string) {
  // 解答を取得
  const { data: submission, error: submissionError } = await supabase
    .from("quiz_submissions")
    .select("*, assignments(id)")
    .eq("id", submissionId)
    .single();

  if (submissionError) {
    console.error("解答の取得に失敗しました:", submissionError);
    return null;
  }

  // 問題を取得
  const questions = await getQuizQuestionsByAssignmentId(
    submission.assignment_id
  );

  // 採点
  let correctCount = 0;
  let totalQuestions = questions.length;

  for (const question of questions) {
    const studentAnswer = submission.answers[question.id];
    const correctOptionIndex = question.options.findIndex(
      (opt: { is_correct: boolean }) => opt.is_correct
    );

    if (studentAnswer === correctOptionIndex) {
      correctCount++;
    }
  }

  // スコアを計算 (100点満点)
  const score =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // スコアを更新
  const { data, error } = await supabase
    .from("quiz_submissions")
    .update({
      score: score,
      correct_count: correctCount,
      total_questions: totalQuestions,
      graded_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .select()
    .single();

  if (error) {
    console.error("採点の更新に失敗しました:", error);
    return null;
  }

  return data;
}
