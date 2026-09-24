"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseClient } from "@/lib/firebase.client";
import { signOut } from "firebase/auth";
import { CATEGORIES } from "@/lib/types";

// Each tab maps to a category. `children` is optional — leave it undefined
// for a plain link, or add entries to turn the tab into a hover dropdown.
// Example, once sub-tracks exist:
// { id: "ai", ..., children: [
//     { label: "Gen AI", href: "/courses?category=ai&track=gen-ai" },
//     { label: "Agentic AI", href: "/courses?category=ai&track=agentic-ai" },
//   ] }
type NavChild = { label: string; href: string };
type NavTab = { id: string; label: string; href: string; children?: NavChild[] };

const NAV_TABS: NavTab[] = CATEGORIES.map((c) => ({
  id: c.id,
  label: c.label,
  href: `/courses?category=${c.id}`,
}));

function NavItem({ tab }: { tab: NavTab }) {
  if (!tab.children || tab.children.length === 0) {
    return (
      <Link href={tab.href} className="whitespace-nowrap hover:text-emerald-800">
        {tab.label}
      </Link>
    );
  }
  return (
    <div className="group relative">
      <Link href={tab.href} className="flex items-center gap-1 whitespace-nowrap hover:text-emerald-800">
        {tab.label}
        <span aria-hidden className="text-xs text-slate-400 group-hover:text-emerald-700">▾</span>
      </Link>
      <div className="invisible absolute left-0 top-full z-50 min-w-[10rem] rounded-md border border-slate-200 bg-white py-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
        {tab.children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            className="block whitespace-nowrap px-3 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
          >
            {child.label}
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight text-emerald-900">
          S8 <span className="font-normal text-slate-500">Analytics</span>
        </Link>
        <nav className="hidden gap-6 overflow-x-auto text-sm text-slate-600 md:flex">
          <Link href="/courses" className="whitespace-nowrap hover:text-emerald-800">Courses</Link>
          {NAV_TABS.map((tab) => (
            <NavItem key={tab.id} tab={tab} />
          ))}
          <Link href="/instructor/apply" className="whitespace-nowrap hover:text-emerald-800">Teach on S8</Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {loading ? null : user ? (
            <>
              <Link
                href={role === "instructor" ? "/instructor" : role === "admin" || role === "super_admin" ? "/admin" : "/dashboard"}
                className="text-slate-700 hover:text-emerald-800"
              >
                {role === "instructor" ? "Instructor Studio" : role === "admin" || role === "super_admin" ? "Admin" : "My Learning"}
              </Link>
              <button onClick={handleSignOut} className="text-slate-500 hover:text-slate-800">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-slate-700 hover:text-emerald-800">Sign in</Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-emerald-700 px-3 py-1.5 font-medium text-white hover:bg-emerald-800"
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
