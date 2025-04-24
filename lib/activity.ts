import { SupabaseClient } from "@supabase/supabase-js";

export type ActivityType =
  | "submission"
  | "grade_received"
  | "feedback_received"
  | "course_enrolled"
  | "assignment_created";

export interface ActivityContent {
  course_id?: string;
  course_title?: string;
  assignment_id?: string;
  assignment_title?: string;
  submission_id?: string;
  grade?: number;
  feedback?: string;
}

export interface Activity {
  id: string;
  user_id: string;
  type: ActivityType;
  content: ActivityContent;
  created_at: string;
}

export async function recordActivity(
  supabase: SupabaseClient,
  userId: string,
  activityType: ActivityType,
  content: ActivityContent
) {
  try {
    const { error } = await supabase.from("activities").insert({
      user_id: userId,
      type: activityType,
      content,
    });

    if (error) {
      console.error("Error recording activity:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in recordActivity:", error);
    throw error;
  }
}
