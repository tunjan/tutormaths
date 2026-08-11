import { requireTutor } from "@/lib/auth";
import { loadLibrary } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { LibraryView } from "@/components/library-view";
import { LibraryManager } from "@/components/library-manager";

export default async function TutorLibrary() {
  await requireTutor();
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
        description={`${categories.length} ${topicLabel} · ${documentCount} ${documentLabel}. Shared with your students.`}
        className="mb-5 sm:flex-col sm:items-stretch lg:flex-row lg:items-end"
        actions={
          <LibraryManager
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          />
        }
      />

      <LibraryView categories={categories} canManage />
    </div>
  );
}
