/** Per-file upload cap — mirrors the bucket policy and DB check (20 MB). */
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

/** Tutor-uploaded assignment files. */
export const ASSIGNMENT_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

/** Student-uploaded work. */
export const SUBMISSION_MIME = ["application/pdf", "image/jpeg"] as const;

export const BUCKET_ASSIGNMENTS = "assignment-files";
export const BUCKET_SUBMISSIONS = "submissions";
export const BUCKET_LIBRARY = "library";

/** Documents the tutor can upload to the shared Library. */
export const LIBRARY_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;
