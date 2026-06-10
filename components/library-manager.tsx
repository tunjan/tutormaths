"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  createCategory,
  createLibraryDocument,
  type CategoryRow,
} from "@/lib/actions/library";
import { BUCKET_LIBRARY, LIBRARY_MIME, MAX_FILE_BYTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { FileDropzone } from "@/components/ui/file-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NEW_CATEGORY = "__new__";
const accept = LIBRARY_MIME as readonly string[];

/** Tutor-only Library controls: create a category and upload a document. */
export function LibraryManager({ categories }: { categories: CategoryRow[] }) {
  const [catOpen, setCatOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => setCatOpen(true)}>
        <FolderPlus /> New topic
      </Button>
      <Button onClick={() => setUploadOpen(true)}>
        <Upload /> Upload document
      </Button>

      <NewCategoryModal open={catOpen} onClose={() => setCatOpen(false)} />
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        categories={categories}
      />
    </div>
  );
}

function NewCategoryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const clean = name.trim();
    if (!clean) return;
    setBusy(true);
    try {
      await createCategory(clean);
      toast.success(`Topic “${clean}” created.`);
      setName("");
      onClose();
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New topic"
      description="Topics group your Library documents and tag assignments."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !name.trim()}>
            {busy ? "Creating…" : "Create topic"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="cat-name">Topic name</Label>
        <Input
          id="cat-name"
          value={name}
          autoFocus
          placeholder="Calculus"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
      </div>
    </Modal>
  );
}

function UploadModal({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [categoryId, setCategoryId] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const creatingNew = categoryId === NEW_CATEGORY;

  function reset() {
    setCategoryId("");
    setNewCategory("");
    setTitle("");
    setFile(null);
    setError("");
  }

  async function submit() {
    setError("");
    const cleanTitle = title.trim();
    if (!categoryId) return setError("Choose a topic.");
    if (creatingNew && !newCategory.trim())
      return setError("Name the new topic.");
    if (!cleanTitle) return setError("Give the document a title.");
    if (!file) return setError("Attach a file.");
    if (!accept.includes(file.type))
      return setError("Allowed types: PDF, JPG, PNG.");
    if (file.size > MAX_FILE_BYTES)
      return setError("That file is larger than 20 MB.");

    setBusy(true);
    try {
      // Resolve the category first (creating it if the tutor typed a new name).
      const resolvedId = creatingNew
        ? (await createCategory(newCategory)).id
        : categoryId;

      const docId = crypto.randomUUID();
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${resolvedId}/${docId}/${safeName}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET_LIBRARY)
        .upload(path, file, { contentType: file.type });
      if (upErr) throw new Error(upErr.message);

      try {
        await createLibraryDocument({
          id: docId,
          categoryId: resolvedId,
          title: cleanTitle,
          filePath: path,
          mimeType: file.type,
          sizeBytes: file.size,
        });
      } catch (err) {
        // Row insert failed — remove the orphaned upload.
        await supabase.storage.from(BUCKET_LIBRARY).remove([path]);
        throw err;
      }

      toast.success("Document added to the Library.");
      reset();
      onClose();
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!busy) {
          reset();
          onClose();
        }
      }}
      title="Upload document"
      description="Add reference material to the shared Library."
      footer={
        <>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "Uploading…" : "Upload"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label id="upload-topic-label">Topic</Label>
          <Select
            value={categoryId}
            onValueChange={(v) => setCategoryId(v ?? "")}
          >
            <SelectTrigger
              aria-labelledby="upload-topic-label"
              className="w-full"
            >
              <SelectValue placeholder="Choose a topic…">
                {creatingNew
                  ? "New topic…"
                  : categories.find((c) => c.id === categoryId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
              <SelectItem value={NEW_CATEGORY}>
                <Plus className="size-3.5" /> Create new topic…
              </SelectItem>
            </SelectContent>
          </Select>
          {creatingNew && (
            <Input
              value={newCategory}
              autoFocus
              placeholder="New topic name"
              onChange={(e) => setNewCategory(e.target.value)}
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="doc-title">Title</Label>
          <Input
            id="doc-title"
            value={title}
            placeholder="Differentiation — formula sheet"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>File</Label>
          <FileDropzone
            accept={accept.join(",")}
            hint="PDF, JPG or PNG, up to 20 MB"
            selectedName={file?.name}
            onFile={(f) => setFile(f ?? null)}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
