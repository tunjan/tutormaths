import { requireStudent } from "@/lib/auth";
import { loadLibrary } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { LibraryView } from "@/components/library-view";

export default async function StudentLibrary() {
  await requireStudent();
  const categories = await loadLibrary();

  return (
    <div className="w-full animate-rise">
      <PageHeader
        title="Library"
        description="Reference material shared by your tutor — browse and download by topic."
      />

      <div>
        <LibraryView categories={categories} canManage={false} />
      </div>
    </div>
  );
}
