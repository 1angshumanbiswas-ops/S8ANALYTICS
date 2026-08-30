import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "S8 Analytics | Learning Marketplace",
  description:
    "Learn practical Excel, AI, Analytics and more from trusted instructors. Live and recorded learning with AI-assisted practice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
            S8 Analytics — One learning marketplace. Multiple expert instructors. Instructor-controlled pricing.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
