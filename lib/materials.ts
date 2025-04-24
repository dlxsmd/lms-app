import { supabase } from "./supabase";
import { Material } from "../types";

export async function getMaterials(courseId: string) {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("course_id", courseId);

  if (error) {
    throw error;
  }

  return data as Material[];
}

export async function getMaterialById(id: string) {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data as Material;
}

export async function createMaterial(
  material: Omit<Material, "id" | "created_at" | "updated_at">
) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("materials")
    .insert({
      ...material,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Material;
}

export async function updateMaterial(
  id: string,
  updates: Partial<Omit<Material, "id" | "created_at" | "updated_at">>
) {
  const { data, error } = await supabase
    .from("materials")
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

  return data as Material;
}

export async function deleteMaterial(id: string) {
  const { error } = await supabase.from("materials").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}
