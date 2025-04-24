import { supabase } from "./supabase";
import { User } from "../types";

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: "teacher" | "student"
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (data?.user) {
    // ユーザープロファイルを作成
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      throw profileError;
    }
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as User;
}
