import "server-only";
import { createClient } from "@/lib/supabase/server";
import { signedUrl } from "@/lib/storage";
import { BUCKET_LIBRARY } from "@/lib/constants";
import type { CommentView } from "@/components/comment-thread";

/**
 * Assignment ids with unread notifications for the current user. Powers the
 * "unread activity" dot on assignment lists. RLS scopes notifications to the
 * recipient, so this only ever returns the caller's own.
 */
export async function unreadAssignmentIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("assignment_id")
    .is("read_at", null)
    .not("assignment_id", "is", null);

  return new Set(
    (data ?? [])
      .map((n) => n.assignment_id)
      .filter((id): id is string => Boolean(id)),
  );
}

/** Loads an assignment's comments with resolved author name + role. */
export async function loadComments(
  assignmentId: string,
): Promise<CommentView[]> {
  const supabase = await createClient();

  const { data: comments } = await supabase
    .from("comments")
    .select("id, body, created_at, author_id")
    .eq("assignment_id", assignmentId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (!comments || comments.length === 0) return [];

  const ids = [...new Set(comments.map((c) => c.author_id))];
  const { data: authors } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("id", ids);

  const byId = new Map((authors ?? []).map((a) => [a.id, a]));

  return comments.map((c) => {
    const a = byId.get(c.author_id);
    return {
      id: c.id,
      body: c.body,
      created_at: c.created_at,
      authorId: c.author_id,
      authorName: a?.full_name || a?.email || "User",
      authorRole: a?.role ?? "student",
    };
  });
}

export interface LibraryDoc {
  id: string;
  title: string;
  mimeType: string;
  sizeBytes: number | null;
  createdAt: string;
  /** Short-lived signed download URL (null if signing failed). */
  url: string | null;
}

export interface LibraryCategory {
  id: string;
  name: string;
  documents: LibraryDoc[];
}

/**
 * Loads every category with its documents and a signed download URL per file.
 * RLS lets both tutors and students read the shared Library, so this is shared
 * by both library pages. Categories come back alphabetically; empty ones are
 * included so the tutor can see topics with no documents yet.
 */
export async function loadLibrary(): Promise<LibraryCategory[]> {
  const supabase = await createClient();

  const [{ data: categories }, { data: docs }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase
      .from("library_documents")
      .select("id, title, mime_type, size_bytes, created_at, file_path, category_id")
      .order("created_at", { ascending: false }),
  ]);

  const withUrls = await Promise.all(
    (docs ?? []).map(async (d) => ({
      categoryId: d.category_id,
      doc: {
        id: d.id,
        title: d.title,
        mimeType: d.mime_type,
        sizeBytes: d.size_bytes,
        createdAt: d.created_at,
        url: await signedUrl(BUCKET_LIBRARY, d.file_path),
      } satisfies LibraryDoc,
    })),
  );

  const byCategory = new Map<string, LibraryDoc[]>();
  for (const { categoryId, doc } of withUrls) {
    const list = byCategory.get(categoryId);
    if (list) list.push(doc);
    else byCategory.set(categoryId, [doc]);
  }

  return (categories ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    documents: byCategory.get(c.id) ?? [],
  }));
}
