"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseClient } from "@/lib/firebase.client";
import { signOut } from "firebase/auth";
import { CATEGORIES } from "@/lib/types";

// A single "Courses" mega-dropdown lists every academy, instead of one flat
// nav tab per category — with 8+ categories, flat tabs overflow the header.
// To add sub-tracks under a category later (e.g. AI -> Gen AI, Agentic AI),
// give that category's CATEGORIES entry a `children` array of
// { label, href } and CourseMenu below will render it as a nested column.

function CourseMenu() {
  return (
    <div className="group relative">
      <Link href="/courses" className="flex items-center gap-1 whitespace-nowrap hover:text-emerald-800">
        Courses
        <span aria-hidden className="text-xs text-slate-400 group-hover:text-emerald-700">▾</span>
      </Link>
      <div className="invisible absolute left-0 top-full z-50 grid w-[36rem] grid-cols-2 gap-x-6 gap-y-1 rounded-lg border border-slate-200 bg-white p-3 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/courses?category=${c.id}`}
            className="flex items-start gap-2 rounded-md px-2 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <span aria-hidden>{c.icon}</span>
            <span className="whitespace-nowrap">{c.navLabel}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { user, role, loading } = useAuth();

  async function handleSignOut() {
    const { auth } = getFirebaseClient();
    await signOut(auth);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center px-6 py-3">
        <Link href="/" className="flex shrink-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Sovereign Eight Analytics" className="h-16 w-auto" />
        </Link>

        <nav className="ml-10 hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <CourseMenu />
          <Link href="/instructor/apply" className="whitespace-nowrap hover:text-emerald-800">Teach on S8</Link>
        </nav>

        <div className="ml-auto flex items-center gap-4 pl-6 text-sm">
          {loading ? null : user ? (
            <>
              <Link
                href={role === "instructor" ? "/instructor" : role === "admin" || role === "super_admin" ? "/admin" : "/dashboard"}
                className="whitespace-nowrap text-slate-700 hover:text-emerald-800"
              >
                {role === "instructor" ? "Instructor Studio" : role === "admin" || role === "super_admin" ? "Admin" : "My Learning"}
              </Link>
              <button onClick={handleSignOut} className="whitespace-nowrap text-slate-500 hover:text-slate-800">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="whitespace-nowrap text-slate-700 hover:text-emerald-800">Sign in</Link>
              <Link
                href="/sign-up"
                className="whitespace-nowrap rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
