import Link from "next/link";
import { RoleGuard } from "@/components/role-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["admin", "super_admin"]}>
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <aside className="w-48 flex-none space-y-1 text-sm">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Admin Control Tower</p>
          <Link href="/admin" className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">Approval Queue</Link>
          <Link href="/admin/instructors" className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">Instructors</Link>
          <Link href="/admin/payouts" className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">Payouts</Link>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </RoleGuard>
  );
}
