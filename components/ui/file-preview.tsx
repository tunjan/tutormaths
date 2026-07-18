import { cn } from "@/lib/utils";

/**
 * Inline preview of a private-bucket file via its signed URL: PDFs in an
 * iframe, images inline. No client JS needed — it is just markup.
 */
export function FilePreview({
  url,
  mimeType,
  title,
  className,
}: {
  url: string;
  mimeType: string;
  title?: string;
  className?: string;
}) {
  const isPdf = mimeType === "application/pdf";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-bg-muted",
        className,
      )}
    >
      {isPdf ? (
        <iframe
          src={url}
          title={title ?? "PDF preview"}
          className="h-[70vh] w-full lg:h-[calc(100vh-9rem)]"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={title ?? "Submitted work"}
          className="max-h-[70vh] w-full object-contain lg:max-h-[calc(100vh-9rem)]"
        />
      )}
    </div>
  );
}
