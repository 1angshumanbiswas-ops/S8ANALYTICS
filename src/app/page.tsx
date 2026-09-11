import Link from "next/link";
import { CATEGORIES } from "@/lib/types";

const CATEGORY_META: Record<string, { emoji: string; blurb: string }> = {
  excel: { emoji: "📊", blurb: "Dashboards, formulas & AI-assisted reporting" },
  ai: { emoji: "🤖", blurb: "Prompting, automation & building with AI" },
  analytics: { emoji: "📈", blurb: "Power BI, SQL & decision-ready data" },
  astrology: { emoji: "✨", blurb: "Vedic tools, charts & practitioner skills" },
};

const STUDENT_STEPS = [
  { n: "01", title: "Pick your track", copy: "Browse academies across Excel, AI, Analytics & more — priced by the instructor, not a paywall." },
  { n: "02", title: "Learn your way", copy: "Live sessions, recorded lessons, and AI-assisted practice you can revisit anytime." },
  { n: "03", title: "Prove it", copy: "Finish with a verifiable certificate you can put straight on LinkedIn." },
];

const INSTRUCTOR_PERKS = [
  { emoji: "💰", title: "You set the price", copy: "Full control over pricing — S8 takes a transparent platform commission, shown before you publish." },
  { emoji: "🚀", title: "Built-in audience", copy: "One marketplace, multiple academies — students discover you through S8's catalogue and search." },
  { emoji: "📊", title: "Real-time earnings", copy: "Track sales and payouts from your Instructor Studio the moment a student enrols." },
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* Announcement bar */}
      <div className="relative bg-slate-950 px-4 py-2 text-center text-xs font-medium text-emerald-200">
        <span className="inline-flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Founding cohort now open — be among the first 100 students & 25 instructor academies
        </span>
      </div>

      {/* Hero */}
      <section className="relative bg-[radial-gradient(circle_at_20%_-10%,#065f46,transparent_45%),radial-gradient(circle_at_90%_10%,#0f766e,transparent_40%),linear-gradient(180deg,#022c22,#04120e)] px-6 py-24 text-white sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-300">
            One marketplace · Every instructor keeps control
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl">
            Learn skills that{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              actually pay off
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-emerald-100/90">
            Excel, AI, Analytics & more — taught live by real practitioners, sharpened with AI-assisted
            practice, and backed by a certificate worth showing off.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="group w-full rounded-xl bg-white px-7 py-3.5 text-center text-sm font-semibold text-emerald-950 shadow-[0_0_0_0_rgba(16,185,129,0.4)] transition hover:shadow-[0_0_30px_4px_rgba(16,185,129,0.4)] sm:w-auto"
            >
              Start learning free
              <span className="ml-1 inline-block transition group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/instructor/apply"
              className="w-full rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 sm:w-auto"
            >
              Launch your academy
            </Link>
          </div>
          <div className="mx-auto mt-14 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-emerald-200/80">
            <span>🔴 Live + recorded</span>
            <span>🧠 AI-assisted practice</span>
            <span>🎓 Verifiable certificates</span>
            <span>💸 Instructor-controlled pricing</span>
          </div>
        </div>
      </section>

      {/* Category bento */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Pick your academy</h2>
          <p className="mt-2 text-slate-500">Every category, one marketplace, instructors you can trust.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c.id] ?? { emoji: "📚", blurb: "Browse published courses" };
            return (
              <Link
                key={c.id}
                href={`/courses?category=${c.id}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-50 transition group-hover:scale-150 group-hover:bg-emerald-100" />
                <div className="relative">
                  <span className="text-3xl">{meta.emoji}</span>
                  <p className="mt-4 font-semibold text-slate-900">{c.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{meta.blurb}</p>
                  <p className="mt-4 text-sm font-medium text-emerald-700">
                    Explore <span className="inline-block transition group-hover:translate-x-1">→</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Student path */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">How it works for students</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STUDENT_STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-slate-200 bg-white p-6">
                <span className="text-4xl font-bold text-emerald-100">{s.n}</span>
                <p className="mt-2 font-semibold text-slate-900">{s.title}</p>
                <p className="mt-1 text-sm text-slate-500">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor path */}
      <section className="relative overflow-hidden bg-emerald-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">For instructors</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Turn what you know into an academy — not a side gig.
              </h2>
              <p className="mt-4 text-emerald-100/90">
                Founding instructors get priority placement in the catalogue and early access to every new
                feature we ship. Applications for the first 25 academies are open now.
              </p>
              <Link
                href="/instructor/apply"
                className="mt-8 inline-flex items-center gap-1 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50"
              >
                Apply to teach on S8 →
              </Link>
            </div>
            <div className="grid gap-4">
              {INSTRUCTOR_PERKS.map((p) => (
                <div key={p.title} className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <p className="mt-1 text-sm text-emerald-100/80">{p.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-emerald-700 to-teal-700 px-8 py-14 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to join the founding cohort?</h2>
          <p className="mx-auto mt-3 max-w-xl text-emerald-100">
            Whether you&apos;re here to learn or to teach, the door&apos;s open right now — it won&apos;t stay this easy
            to stand out forever.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/sign-up" className="w-full rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-emerald-800 sm:w-auto">
              Create your free account
            </Link>
            <Link href="/instructor/apply" className="w-full rounded-xl border border-white/40 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 sm:w-auto">
              Apply to teach
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
