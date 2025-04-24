import { supabase } from "./supabase";
import { Assignment, Submission } from "../types";

export async function getAssignments(courseId: string) {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("course_id", courseId);

  if (error) {
    throw error;
  }

  return data as Assignment[];
}

export async function getAssignmentById(id: string) {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data as Assignment;
}

export async function createAssignment(
  assignment: Omit<Assignment, "id" | "created_at" | "updated_at">
) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      ...assignment,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Assignment;
}

export async function updateAssignment(
  id: string,
  updates: Partial<Omit<Assignment, "id" | "created_at" | "updated_at">>
) {
  const { data, error } = await supabase
    .from("assignments")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Assignment;
}

export async function deleteAssignment(id: string) {
  const { error } = await supabase.from("assignments").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

export async function submitAssignment(submissionData: {
  assignment_id: string;
  student_id: string;
  submission_content: any;
}) {
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      ...submissionData,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Submission;
}

export async function getSubmissions(assignmentId: string) {
  const { data, error } = await supabase
    .from("submissions")
    .select("*, users(*)")
    .eq("assignment_id", assignmentId);

  if (error) {
    throw error;
  }

  return data;
}

export async function getStudentSubmission(
  assignmentId: string,
  studentId: string
) {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .eq("student_id", studentId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116は「レコードが見つからない」エラー
    throw error;
  }

  return data as Submission | null;
}

export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string,
  gradedBy: string
) {
  const { data, error } = await supabase
    .from("submissions")
    .update({
      grade,
      feedback,
      graded_by: gradedBy,
      graded_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .select(
      `
      *,
      assignments(
        id,
        title,
        courses(
          id,
          title
        )
      )
    `
    )
    .single();

  if (error) {
    throw error;
  }

  // 採点結果のアクティビティを記録
  try {
    await supabase.from("activities").insert({
      user_id: data.student_id,
      type: "grade_received",
      content: {
        course_id: data.assignments.courses.id,
        course_title: data.assignments.courses.title,
        assignment_id: data.assignments.id,
        assignment_title: data.assignments.title,
        grade: grade,
        submission_id: data.id,
      },
    });

    // フィードバックがある場合は、フィードバックのアクティビティも記録
    if (feedback) {
      await supabase.from("activities").insert({
        user_id: data.student_id,
        type: "feedback_received",
        content: {
          course_id: data.assignments.courses.id,
          course_title: data.assignments.courses.title,
          assignment_id: data.assignments.id,
          assignment_title: data.assignments.title,
          submission_id: data.id,
        },
      });
    }
  } catch (activityError) {
    console.error("アクティビティの記録に失敗しました:", activityError);
  }

  return data as Submission;
}

export async function getAssignmentsByCourseId(courseId: string) {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("course_id", courseId);

  if (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }

  return data || [];
}
