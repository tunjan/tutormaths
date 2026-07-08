import { Download, FileText, FolderOpen } from "lucide-react";
import type { LibraryCategory } from "@/lib/queries";
import { formatDate, humanFileSize } from "@/lib/format";
import { LibraryDeleteButton } from "@/components/library-delete-button";

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
      <div className="card flex flex-col items-center justify-center gap-4 py-16 text-center">
        <FolderOpen className="size-8 text-content-subtle" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold text-foreground">
          The Library is empty
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-content-subtle">
          {canManage
            ? "Create a topic and upload your first document to share it with your students."
            : "Your tutor hasn’t shared any resources yet. Check back soon."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {categories.map((category) => (
        <section key={category.id} className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4 border-b border-border-subtle pb-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-h4 font-semibold tracking-tight text-foreground">
                {category.name}
              </h2>
              <span className="font-mono text-xs text-content-subtle">
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
            <p className="px-1 text-sm text-content-subtle">
              No documents in this topic yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {category.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="card card-interactive group flex items-start gap-3 p-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border-subtle bg-bg-subtle text-content-subtle">
                    <FileText className="size-5" strokeWidth={1.5} />
                  </span>

                  <div className="min-w-0 flex-1">
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:underline"
                      >
                        <span className="truncate">{doc.title}</span>
                        <Download className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-75" />
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-content-subtle">
                        {doc.title}
                      </span>
                    )}
                    <p className="mt-0.5 truncate font-mono text-xs text-content-subtle">
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
