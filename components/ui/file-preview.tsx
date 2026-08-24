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
        <>
          <div className="flex min-h-48 items-center justify-center p-6 text-center text-body text-muted-foreground sm:hidden">
            Open the PDF in a new tab to read it comfortably on a small screen.
          </div>
          <iframe
            src={url}
            title={title ?? "PDF preview"}
            className="hidden h-[36rem] w-full sm:block lg:h-[calc(100vh-12rem)]"
          />
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={title ?? "Submitted work"}
          className="min-h-64 max-h-[70vh] w-full object-contain lg:max-h-[calc(100vh-12rem)]"
          decoding="async"
        />
      )}
    </div>
  );
}
