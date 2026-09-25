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
  verification: {
    google: "t86hZzB9jnEdsMRYNGffv-KuQCHuh1P1u30SylQCUW0",
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
            <div className="mx-auto flex items-center justify-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Sovereign Eight Analytics" className="h-10 w-auto opacity-90" />
              <span
                aria-hidden
                className="relative hidden h-7 w-7 shrink-0 overflow-hidden rounded-md bg-[#152A4A] sm:block"
              >
                <span
                  className="absolute inset-0 bg-[#2E9C90]"
                  style={{ clipPath: "polygon(100% 0, 100% 100%, 35% 100%)" }}
                />
                <span className="relative z-10 flex h-full w-full items-center justify-center text-[10px] font-bold tracking-tight text-white">
                  S8
                </span>
              </span>
            </div>
            <p className="mt-3">
              S8 Analytics — One learning marketplace. Multiple expert instructors. Instructor-controlled pricing.
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
