"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseClient } from "@/lib/firebase.client";

export interface PortalCourse {
  courseId: string;
  title: string;
}

const TABS = [
  { href: "/ai", label: "Home", exact: true },
  { href: "/ai/library", label: "Content Library" },
  { href: "/ai/members", label: "Members" },
  { href: "/ai/leaderboard", label: "Leaderboard" },
];

function S8Badge() {
  // Same navy/teal diagonal-split mark used in the main site header.
  return (
    <span aria-hidden className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-s8-navy-soft ring-1 ring-white/20">
      <span className="absolute inset-0 bg-s8-teal" style={{ clipPath: "polygon(100% 0, 100% 100%, 35% 100%)" }} />
      <span className="relative z-10 flex h-full w-full items-center justify-center text-xs font-bold tracking-tight text-white">
        S8
      </span>
    </span>
  );
}

function CourseNav({ courses, activeId, onNavigate }: { courses: PortalCourse[]; activeId?: string; onNavigate?: () => void }) {
  return (
    <>
      <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-s8-teal">AI Academy</p>
      {courses.length === 0 ? (
        <p className="px-3 py-2 text-sm text-slate-300">Courses are being added. Please check back soon.</p>
      ) : (
        <ul className="space-y-1">
          {courses.map((c) => {
            const active = c.courseId === activeId;
            return (
              <li key={c.courseId}>
                <Link
                  href={`/ai/${c.courseId}`}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active ? "bg-s8-navy-soft font-medium text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`h-2 w-2 shrink-0 rounded-full ${active ? "bg-s8-teal" : "bg-slate-500"}`}
                  />
                  <span className="line-clamp-2">{c.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export function PortalShell({ courses, children }: { courses: PortalCourse[]; children: React.ReactNode }) {
  const pathname = usePathname() ?? "/ai";
  const router = useRouter();
  const { user, loading } = useAuth();
  const segments = pathname.split("/").filter(Boolean);
  const reserved = ["library", "members", "leaderboard"];
  const activeId = segments[1] && !reserved.includes(segments[1]) ? segments[1] : undefined;

  async function handleSignOut() {
    const { auth } = getFirebaseClient();
    await signOut(auth);
    router.push("/ai");
  }

  const initial = (user?.displayName || user?.email || "S").trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 bg-s8-navy text-white">
        <div className="flex flex-wrap items-center gap-x-4 px-4 sm:h-14 sm:flex-nowrap sm:px-6">
          <Link href="/ai" className="flex h-14 shrink-0 items-center gap-2.5" aria-label="S8 Analytics AI Academy home">
            <S8Badge />
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">S8 Analytics</span>
          </Link>

          <nav className="order-last flex w-full items-center gap-1 overflow-x-auto pb-2 text-sm sm:order-none sm:mx-auto sm:w-auto sm:pb-0" aria-label="Portal">
            {TABS.map((t) => {
              const active = t.exact ? pathname === t.href || (activeId !== undefined) : pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-md px-2.5 py-1.5 transition sm:px-3 ${
                    active ? "bg-white/10 font-medium text-white" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-3 text-sm sm:ml-0">
            {loading ? null : user ? (
              <>
                <Link href="/dashboard" className="hidden text-slate-300 hover:text-white sm:inline">
                  My Learning
                </Link>
                <button onClick={handleSignOut} className="hidden text-slate-300 hover:text-white sm:inline">
                  Sign out
                </button>
                <span
                  aria-hidden
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-s8-teal text-xs font-semibold text-white"
                >
                  {initial}
                </span>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="rounded-md bg-s8-teal-dark px-3 py-1.5 font-medium text-white hover:bg-s8-teal"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 shrink-0 flex-col overflow-y-auto bg-s8-navy p-3 lg:flex">
          <CourseNav courses={courses} activeId={activeId} />
          <div className="mt-auto space-y-1 border-t border-white/10 pt-3 text-sm">
            <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white">
              My Learning
            </Link>
            <Link href="/courses" className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white">
              All S8 courses
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <details className="group border-b border-slate-200 bg-s8-navy lg:hidden">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-white">
              <span className="flex items-center justify-between">
                Browse AI courses
                <span aria-hidden className="text-slate-300 transition group-open:rotate-180">▾</span>
              </span>
            </summary>
            <div className="px-3 pb-3">
              <CourseNav courses={courses} activeId={activeId} />
            </div>
          </details>
          <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
