import { Download, FileText, FolderOpen } from "lucide-react";
import type { LibraryCategory } from "@/lib/queries";
import { formatDate, humanFileSize } from "@/lib/format";
import { LibraryDeleteButton } from "@/components/library-delete-button";

/**
 * Shared, read-first rendering of the Library: documents grouped by topic.
 * Both the tutor and student pages render this; `canManage` adds the per-item
 * and per-topic delete controls (tutors only).
 */
export function LibraryView({
  categories,
  canManage,
}: {
  categories: LibraryCategory[];
  canManage: boolean;
}) {
  const hasAny = categories.length > 0;

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-secondary/20 py-24 text-center">
        <FolderOpen className="size-7 text-muted-foreground" strokeWidth={1.5} />
        <h3 className="text-lg font-medium text-foreground">
          The Library is empty
        </h3>
        <p className="max-w-md text-[15px] leading-[1.6] text-muted-foreground">
          {canManage
            ? "Create a topic and upload your first document to share it with your students."
            : "Your tutor hasn’t shared any resources yet. Check back soon."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {categories.map((category) => (
        <section key={category.id} className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4 border-b border-border/40 pb-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-[20px] font-medium tracking-tight text-foreground">
                {category.name}
              </h2>
              <span className="font-mono text-[12px] uppercase tracking-[0.05em] text-muted-foreground">
                {category.documents.length} doc
                {category.documents.length === 1 ? "" : "s"}
              </span>
            </div>
            {canManage && (
              <LibraryDeleteButton
                kind="category"
                id={category.id}
                name={category.name}
              />
            )}
          </div>

          {category.documents.length === 0 ? (
            <p className="px-1 text-[14px] text-muted-foreground">
              No documents in this topic yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-accent/30"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary/40 text-muted-foreground">
                    <FileText className="size-5" strokeWidth={1.5} />
                  </span>

                  <div className="min-w-0 flex-1">
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[15px] font-medium text-foreground hover:underline"
                      >
                        <span className="truncate">{doc.title}</span>
                        <Download className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-70" />
                      </a>
                    ) : (
                      <span className="text-[15px] font-medium text-muted-foreground">
                        {doc.title}
                      </span>
                    )}
                    <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                      {[
                        formatDate(doc.createdAt),
                        humanFileSize(doc.sizeBytes),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>

                  {canManage && (
                    <LibraryDeleteButton
                      kind="document"
                      id={doc.id}
                      name={doc.title}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
