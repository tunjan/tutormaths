import { requireTutor } from "@/lib/auth";
import { loadLibrary } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { LibraryView } from "@/components/library-view";
import { LibraryManager } from "@/components/library-manager";

export default async function TutorLibrary() {
  await requireTutor();
  const categories = await loadLibrary();

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Tutor workspace"
        title="Library"
        description="Shared resources your students can read and download, grouped by topic."
        actions={
          <LibraryManager
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          />
        }
      />

      <div>
        <LibraryView categories={categories} canManage />
      </div>
    </div>
  );
}
