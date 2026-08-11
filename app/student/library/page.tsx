import { requireStudent } from "@/lib/auth";
import { loadLibrary } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { LibraryView } from "@/components/library-view";

export default async function StudentLibrary() {
  await requireStudent();
  const categories = await loadLibrary();
  const documentCount = categories.reduce(
    (total, category) => total + category.documents.length,
    0,
  );
  const topicLabel = categories.length === 1 ? "topic" : "topics";
  const documentLabel = documentCount === 1 ? "document" : "documents";

  return (
    <div className="mx-auto w-full max-w-[1120px] animate-rise">
      <PageHeader
        title="Library"
        description={`${categories.length} ${topicLabel} · ${documentCount} ${documentLabel}. Shared by your tutor.`}
        className="mb-5"
      />

      <LibraryView categories={categories} canManage={false} />
    </div>
  );
}
