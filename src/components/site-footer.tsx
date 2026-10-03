"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  // The AI learner portal (/ai/*) is a full-screen app shell with no footer.
  if (pathname === "/ai" || pathname?.startsWith("/ai/")) return null;
  return (
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
  );
}
