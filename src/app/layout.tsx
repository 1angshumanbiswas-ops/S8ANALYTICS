import type { Metadata } from "next";
import Script from "next/script";
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

const GA_MEASUREMENT_ID = "G-7CGCSK1WG0";

export const metadata: Metadata = {
  // Lets every relative URL in metadata fields (canonical links, OG images,
  // etc.) across the app resolve to a full https://learn.s8analytics.com/...
  // URL instead of needing to be spelled out absolutely on every page.
  metadataBase: new URL("https://learn.s8analytics.com"),
  title: "S8 Analytics | Learning Marketplace",
  description:
    "Learn practical Excel, AI, Analytics and more from trusted instructors. Live and recorded learning with AI-assisted practice.",
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "t86hZzB9jnEdsMRYNGffv-KuQCHuh1P1u30SylQCUW0",
  },
};

// Organization structured data (JSON-LD) - helps Google understand S8
// Analytics as a distinct entity (used in Knowledge Panel / rich results).
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "S8 Analytics",
  url: "https://learn.s8analytics.com",
  logo: "https://learn.s8analytics.com/logo.png",
  description:
    "S8 Analytics is a learning marketplace offering practical, instructor-led courses in Excel, AI, Data Analytics, Project Management, Cybersecurity, Digital Marketing and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
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
