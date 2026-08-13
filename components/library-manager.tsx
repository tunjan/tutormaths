"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, FolderPlus, Plus, Upload } from "lucide-react";
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
import { Modal } from "@/components/ui/modal";
import { FileDropzone } from "@/components/ui/file-dropzone";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectGroup,
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
    <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:w-auto">
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => setCatOpen(true)}
      >
        <FolderPlus data-icon="inline-start" /> New topic
      </Button>
      <Button
        className="w-full sm:w-auto"
        onClick={() => setUploadOpen(true)}
      >
        <Upload data-icon="inline-start" /> Upload document
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
  const [error, setError] = useState("");

  function close() {
    if (busy) return;
    setName("");
    setError("");
    onClose();
  }

  async function submit() {
    const clean = name.trim();
    if (!clean) return;
    setError("");
    setBusy(true);
    try {
      await createCategory(clean);
      toast.success(`Topic “${clean}” created.`);
      setName("");
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
      onClose={close}
      title="New topic"
      description="Topics group your Library documents and tag assignments."
      footer={
        <>
          <Button type="button" variant="ghost" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="new-library-topic-form"
            disabled={busy || !name.trim()}
          >
            {busy ? "Creating…" : "Create topic"}
          </Button>
        </>
      }
    >
      <form
        id="new-library-topic-form"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Field>
          <FieldLabel htmlFor="cat-name">Topic name</FieldLabel>
          <Input
            id="cat-name"
            value={name}
            autoFocus
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "new-topic-error" : undefined}
            placeholder="Calculus"
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
            }}
          />
        </Field>
        {error ? (
          <Alert variant="destructive" role="alert" className="mt-4">
            <AlertCircle aria-hidden />
            <AlertDescription id="new-topic-error">{error}</AlertDescription>
          </Alert>
        ) : null}
      </form>
    </Modal>
  );
}

type UploadField = "topic" | "new-topic" | "title" | "file";

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
  const [error, setError] = useState<{
    message: string;
    field?: UploadField;
  } | null>(null);

  const creatingNew = categoryId === NEW_CATEGORY;

  function reset() {
    setCategoryId("");
    setNewCategory("");
    setTitle("");
    setFile(null);
    setError(null);
  }

  async function submit() {
    setError(null);
    const cleanTitle = title.trim();
    if (!categoryId)
      return setError({ message: "Choose a topic.", field: "topic" });
    if (creatingNew && !newCategory.trim())
      return setError({ message: "Name the new topic.", field: "new-topic" });
    if (!cleanTitle)
      return setError({ message: "Give the document a title.", field: "title" });
    if (!file) return setError({ message: "Attach a file.", field: "file" });
    if (!accept.includes(file.type))
      return setError({
        message: "Allowed types: PDF, JPG, PNG.",
        field: "file",
      });
    if (file.size > MAX_FILE_BYTES)
      return setError({
        message: "That file is larger than 20 MB.",
        field: "file",
      });

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
      setError({ message: (err as Error).message });
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
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="upload-library-document-form"
            disabled={busy}
          >
            {busy ? "Uploading…" : "Upload"}
          </Button>
        </>
      }
    >
      <form
        id="upload-library-document-form"
        aria-describedby={error ? "upload-document-error" : undefined}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel id="upload-topic-label">Topic</FieldLabel>
            <Select
              value={categoryId}
              onValueChange={(value) => {
                setCategoryId(value ?? "");
                if (error?.field === "topic") setError(null);
              }}
            >
              <SelectTrigger
                aria-labelledby="upload-topic-label"
                aria-invalid={error?.field === "topic"}
                className="w-full"
              >
                <SelectValue placeholder="Choose a topic…">
                  {creatingNew
                    ? "New topic…"
                    : categories.find((c) => c.id === categoryId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                  <SelectItem value={NEW_CATEGORY}>
                    <Plus /> Create new topic…
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {creatingNew ? (
              <div className="mt-2 flex flex-col gap-2">
                <FieldLabel htmlFor="new-upload-topic-name">
                  New topic name
                </FieldLabel>
                <Input
                  id="new-upload-topic-name"
                  value={newCategory}
                  autoFocus
                  autoComplete="off"
                  aria-invalid={error?.field === "new-topic"}
                  placeholder="Trigonometry"
                  onChange={(event) => {
                    setNewCategory(event.target.value);
                    if (error?.field === "new-topic") setError(null);
                  }}
                />
              </div>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="doc-title">Title</FieldLabel>
            <Input
              id="doc-title"
              value={title}
              aria-invalid={error?.field === "title"}
              placeholder="Differentiation — formula sheet"
              onChange={(event) => {
                setTitle(event.target.value);
                if (error?.field === "title") setError(null);
              }}
            />
          </Field>

          <Field>
            <FieldLabel>File</FieldLabel>
            <FileDropzone
              accept={accept.join(",")}
              hint="PDF, JPG or PNG, up to 20 MB"
              selectedName={file?.name}
              className={
                error?.field === "file" ? "border-destructive" : undefined
              }
              onFile={(nextFile) => {
                setFile(nextFile ?? null);
                if (error?.field === "file") setError(null);
              }}
            />
          </Field>

          {error ? (
            <Alert variant="destructive" role="alert">
              <AlertCircle aria-hidden />
              <AlertDescription id="upload-document-error">
                {error.message}
              </AlertDescription>
            </Alert>
          ) : null}
        </FieldGroup>
      </form>
    </Modal>
  );
}
