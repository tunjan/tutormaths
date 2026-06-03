import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";

/** Entry point: route users to their role home, or to /login. */
export default async function Home() {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");
  redirect(ctx.role === "tutor" ? "/tutor" : "/student");
}
