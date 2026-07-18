import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ViewTransitions } from "next-view-transitions";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

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
      className={`${geist.variable} ${geistMono.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="bg-background text-content-default antialiased">
        <ViewTransitions>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            forcedTheme="light"
          >
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster />
          </ThemeProvider>
        </ViewTransitions>
      </body>
    </html>
  );
}
