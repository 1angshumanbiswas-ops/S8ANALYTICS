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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://s8-analytics-lms.netlify.app";
const TITLE = "S8 Analytics | Learn skills that actually pay off";
const DESCRIPTION =
  "Excel, AI, Analytics & more — taught live by real practitioners, sharpened with AI-assisted practice, backed by a verifiable certificate. Founding cohort now open.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["Excel course", "AI course", "data analytics course", "online academy", "instructor marketplace", "S8 Analytics"],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "S8 Analytics",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
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
