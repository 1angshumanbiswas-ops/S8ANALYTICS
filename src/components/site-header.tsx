"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseClient } from "@/lib/firebase.client";
import { signOut } from "firebase/auth";

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
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-emerald-900">
          <Image src="/logo.png" alt="S8 Analytics" width={28} height={21} className="h-7 w-auto" priority />
          S8 <span className="font-normal text-slate-500">Analytics</span>
        </Link>
        <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
          <Link href="/courses" className="hover:text-emerald-800">Courses</Link>
          <Link href="/courses?category=excel" className="hover:text-emerald-800">Excel</Link>
          <Link href="/courses?category=ai" className="hover:text-emerald-800">AI</Link>
          <Link href="/courses?category=astrology" className="hover:text-emerald-800">Astrology</Link>
          <Link href="/instructor/apply" className="hover:text-emerald-800">Teach on S8</Link>
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
