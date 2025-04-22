import { supabase } from "./supabase";
import { Course, CourseEnrollment } from "../types";

export async function getCourses(teacherId?: string) {
  let query = supabase.from("courses").select("*");

  if (teacherId) {
    query = query.eq("teacher_id", teacherId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data as Course[];
}

export async function getCourseById(id: string) {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data as Course;
}

export async function createCourse(
  course: Omit<Course, "id" | "created_at" | "updated_at">
) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("courses")
    .insert({
      ...course,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Course;
}

export async function updateCourse(
  id: string,
  updates: Partial<Omit<Course, "id" | "created_at" | "updated_at">>
) {
  const { data, error } = await supabase
    .from("courses")
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

  return data as Course;
}

export async function deleteCourse(id: string) {
  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

export async function enrollStudent(courseId: string, studentId: string) {
  const { data, error } = await supabase
    .from("course_enrollments")
    .insert({
      course_id: courseId,
      student_id: studentId,
      enrollment_date: new Date().toISOString(),
      status: "active",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as CourseEnrollment;
}

export async function getEnrolledStudents(courseId: string) {
  const { data, error } = await supabase
    .from("course_enrollments")
    .select("*, users(*)")
    .eq("course_id", courseId)
    .eq("status", "active");

  if (error) {
    throw error;
  }

  return data;
}

export async function getEnrolledCourses(studentId: string) {
  const { data, error } = await supabase
    .from("course_enrollments")
    .select("*, courses(*)")
    .eq("student_id", studentId)
    .eq("status", "active");

  if (error) {
    throw error;
  }

  return data;
}
