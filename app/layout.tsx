import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ViewTransitions } from "next-view-transitions";

export const metadata: Metadata = {
  title: "Maths Tasks",
  description: "Private mathematics practice for tutoring students.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="font-sans"
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground antialiased">
        <ViewTransitions>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster />
          </ThemeProvider>
        </ViewTransitions>
      </body>
    </html>
  );
}
