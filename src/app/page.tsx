import Link from "next/link";
import { CATEGORIES } from "@/lib/types";

export default function Home() {
  return (
    <main>
      <section className="bg-gradient-to-b from-emerald-950 to-emerald-900 px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-300">
            One LMS · Multiple academies · Instructor-controlled pricing
          </p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
            Learn practical skills from trusted instructors
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
            Live + recorded learning. AI-assisted practice. Verifiable certificates.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/courses" className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-emerald-900 hover:bg-emerald-50">
              Browse courses
            </Link>
            <Link href="/instructor/apply" className="rounded-md border border-white/40 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10">
              Teach on S8
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-xl font-semibold text-slate-900">Explore academies</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/courses?category=${c.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow"
            >
              <p className="font-medium text-slate-900">{c.label}</p>
              <p className="mt-1 text-sm text-slate-500">Browse published courses →</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
