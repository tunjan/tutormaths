import { ExternalLink, FileText, Folder, FolderOpen } from "lucide-react";
import type { LibraryCategory } from "@/lib/queries";
import { formatDate, humanFileSize } from "@/lib/format";
import { LibraryDeleteButton } from "@/components/library-delete-button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

function documentCountLabel(count: number) {
  return `${count} ${count === 1 ? "document" : "documents"}`;
}

function documentTypeLabel(mimeType: string) {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType === "image/jpeg") return "JPEG";
  if (mimeType === "image/png") return "PNG";
  return "File";
}

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

  const columnCount = canManage ? 4 : 3;

  return (
    <div className="overflow-hidden rounded-md bg-card shadow-xs">
      <table className="w-full table-auto border-collapse sm:table-fixed">
        <caption className="sr-only">
          Library documents grouped by topic
        </caption>
        <thead className="hidden sm:table-header-group">
          <tr className="border-b border-border-default">
            <th
              scope="col"
              className="px-4 py-2 text-left font-eyebrow text-content-subtle sm:px-5"
            >
              Document
            </th>
            <th
              scope="col"
              className="w-36 px-3 py-2 text-left font-eyebrow text-content-subtle"
            >
              Added
            </th>
            <th
              scope="col"
              className="w-28 px-3 py-2 text-left font-eyebrow text-content-subtle"
            >
              Type / size
            </th>
            {canManage ? (
              <th scope="col" className="w-14 px-2 py-2">
                <span className="sr-only">Actions</span>
              </th>
            ) : null}
          </tr>
        </thead>

        {categories.map((category) => (
          <tbody key={category.id}>
            <tr className="bg-bg-subtle">
              <th
                scope="rowgroup"
                colSpan={columnCount}
                className="px-4 py-2.5 text-left sm:px-5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Folder
                    className="size-4 shrink-0 text-content-subtle"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <h2 className="min-w-0 break-words text-label text-content-emphasis">
                    {category.name}
                  </h2>
                  <span className="shrink-0 text-caption font-normal text-content-subtle">
                    {documentCountLabel(category.documents.length)}
                  </span>
                  {canManage ? (
                    <LibraryDeleteButton
                      kind="category"
                      id={category.id}
                      name={category.name}
                    />
                  ) : null}
                </div>
              </th>
            </tr>

            {category.documents.map((doc) => {
              const size = humanFileSize(doc.sizeBytes);
              const type = documentTypeLabel(doc.mimeType);

              return (
                <tr
                  key={doc.id}
                  className="border-t border-border-subtle transition-colors duration-fast hover:bg-bg-default focus-within:bg-bg-default"
                >
                  <td className="px-4 py-2.5 align-middle sm:px-5">
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline-none"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-bg-subtle text-content-subtle">
                          <FileText
                            className="size-4"
                            strokeWidth={1.75}
                            aria-hidden
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="flex min-w-0 items-center gap-1.5 text-label text-content-emphasis transition-colors duration-fast group-hover/link:text-accent-ink group-hover/link:underline">
                            <span className="min-w-0 break-words">{doc.title}</span>
                            <ExternalLink
                              className="size-3.5 shrink-0 text-content-muted transition-colors duration-fast group-hover/link:text-accent-ink"
                              strokeWidth={1.75}
                              aria-hidden
                            />
                          </span>
                          <span className="mt-0.5 block text-caption font-normal text-content-subtle sm:hidden">
                            {[type, formatDate(doc.createdAt), size]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                          <span className="sr-only"> Opens in a new tab.</span>
                        </span>
                      </a>
                    ) : (
                      <div className="flex min-w-0 items-center gap-3 text-content-subtle">
                        <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-bg-subtle">
                          <FileText
                            className="size-4"
                            strokeWidth={1.75}
                            aria-hidden
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block break-words text-label">
                            {doc.title}
                          </span>
                          <span className="mt-0.5 block text-caption sm:hidden">
                            File unavailable
                          </span>
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="hidden px-3 py-2.5 align-middle text-caption text-content-subtle sm:table-cell">
                    <time dateTime={doc.createdAt} className="font-metric">
                      {formatDate(doc.createdAt)}
                    </time>
                  </td>
                  <td className="hidden px-3 py-2.5 align-middle text-caption text-content-subtle sm:table-cell">
                    <span className="font-metric">
                      {type} · {size || "—"}
                    </span>
                  </td>
                  {canManage ? (
                    <td className="w-14 px-2 py-2 align-middle">
                      <div className="flex justify-end">
                        <LibraryDeleteButton
                          kind="document"
                          id={doc.id}
                          name={doc.title}
                        />
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}
