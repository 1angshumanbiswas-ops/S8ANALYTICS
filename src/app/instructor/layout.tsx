import Link from "next/link";
import { RoleGuard } from "@/components/role-guard";

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["instructor", "instructor_team_member", "admin", "super_admin"]}>
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <aside className="w-48 flex-none space-y-1 text-sm">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Instructor Studio</p>
          <Link href="/instructor" className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">Overview</Link>
          <Link href="/instructor/courses" className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">My Courses</Link>
          <Link href="/instructor/courses/new" className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">Create Course</Link>
          <Link href="/instructor/earnings" className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">Earnings</Link>
          <Link href="/instructor/profile" className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">Profile / Storefront</Link>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </RoleGuard>
  );
}
