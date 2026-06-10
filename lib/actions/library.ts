"use server";

import { revalidatePath } from "next/cache";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BUCKET_LIBRARY } from "@/lib/constants";

export interface CategoryRow {
  id: string;
  name: string;
}

/**
 * Creates a topic category (tutor only). Names are unique; if the category
 * already exists we return the existing row instead of erroring, so the
 * "create or pick" flows in the Library and the assignment form are idempotent.
 */
export async function createCategory(name: string): Promise<CategoryRow> {
  const ctx = await requireTutor();
  const clean = name.trim();
  if (!clean) throw new Error("Category name is required.");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: clean, created_by: ctx.userId })
    .select("id, name")
    .single();

  if (error) {
    // Unique-violation → the topic already exists; return it.
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("categories")
        .select("id, name")
        .eq("name", clean)
        .single();
      if (existing) return existing;
    }
    throw new Error(error.message);
  }

  revalidatePath("/tutor/library");
  revalidatePath("/student/library");
  return data;
}

export interface CreateLibraryDocumentInput {
  id: string; // pre-generated UUID (also the storage folder)
  categoryId: string;
  title: string;
  filePath: string; // object key already uploaded to the `library` bucket
  mimeType: string;
  sizeBytes: number | null;
}

/**
 * Records a Library document after the tutor has uploaded its file client-side
 * (under {categoryId}/{id}/...). Tutor only; RLS enforces is_tutor().
 */
export async function createLibraryDocument(
  input: CreateLibraryDocumentInput,
): Promise<void> {
  const ctx = await requireTutor();
  const title = input.title.trim();
  if (!title) throw new Error("Give the document a title.");

  const supabase = await createClient();
  const { error } = await supabase.from("library_documents").insert({
    id: input.id,
    category_id: input.categoryId,
    title,
    file_path: input.filePath,
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes,
    uploaded_by: ctx.userId,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/tutor/library");
  revalidatePath("/student/library");
}

/** Deletes a Library document and its storage object (tutor only). */
export async function deleteLibraryDocument(id: string): Promise<void> {
  await requireTutor();
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("library_documents")
    .select("file_path")
    .eq("id", id)
    .single();

  if (doc?.file_path) {
    await supabase.storage.from(BUCKET_LIBRARY).remove([doc.file_path]);
  }

  const { error } = await supabase
    .from("library_documents")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/tutor/library");
  revalidatePath("/student/library");
}

/**
 * Deletes a category, its documents (FK cascade) and their storage objects.
 * Assignments referencing it have category_id set to NULL (FK on delete set
 * null). Tutor only.
 */
export async function deleteCategory(id: string): Promise<void> {
  await requireTutor();
  const supabase = await createClient();

  const { data: docs } = await supabase
    .from("library_documents")
    .select("file_path")
    .eq("category_id", id);

  if (docs && docs.length > 0) {
    await supabase.storage
      .from(BUCKET_LIBRARY)
      .remove(docs.map((d) => d.file_path));
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/tutor/library");
  revalidatePath("/student/library");
  revalidatePath("/tutor");
}
