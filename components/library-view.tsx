import { Download, FileText, FolderOpen } from "lucide-react";
import type { LibraryCategory } from "@/lib/queries";
import { formatDate, humanFileSize } from "@/lib/format";
import { LibraryDeleteButton } from "@/components/library-delete-button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

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
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen aria-hidden />
          </EmptyMedia>
          <EmptyTitle>The Library is empty</EmptyTitle>
          <EmptyDescription>
            {canManage
              ? "Create a topic and upload your first document to share it with your students."
              : "Your tutor hasn’t shared any resources yet. Check back soon."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {categories.map((category) => (
        <section key={category.id} className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4 border-b border-border-subtle pb-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-h4 text-foreground">
                {category.name}
              </h2>
              <span className="text-micro text-content-subtle">
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
            <p className="px-1 text-body text-content-subtle">
              No documents in this topic yet.
            </p>
          ) : (
            <div className="card-gallery">
              {category.documents.map((doc) => (
                <Card key={doc.id} interactive size="sm" className="group">
                  <CardContent className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-bg-muted text-content-subtle">
                    <FileText className="size-5" strokeWidth={1.5} />
                  </span>

                  <div className="min-w-0 flex-1">
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-label text-foreground hover:underline"
                      >
                        <span className="truncate">{doc.title}</span>
                        <Download className="size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-75" />
                      </a>
                    ) : (
                      <span className="text-label text-content-subtle">
                        {doc.title}
                      </span>
                    )}
                    <p className="mt-1 truncate text-caption text-content-subtle">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
