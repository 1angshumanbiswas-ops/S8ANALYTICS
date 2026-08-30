"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/types";

export function RoleGuard({ allow, children }: { allow: UserRole[]; children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }
    if (role && !allow.includes(role)) {
      router.push("/dashboard");
    }
  }, [user, role, loading, allow, router]);

  if (loading || !user || (role && !allow.includes(role))) {
    return <div className="px-6 py-16 text-center text-sm text-slate-500">Checking access...</div>;
  }

  return <>{children}</>;
}
