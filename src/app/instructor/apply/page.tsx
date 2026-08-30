import Link from "next/link";

export default function TeachOnS8Page() {
  const steps = [
    "Create an account and choose \"Teach on S8\"",
    "Complete your public profile: bio, expertise, languages, photo",
    "Provide verification and payout information (never shown publicly)",
    "Accept the Instructor Agreement and content standards",
    "Complete a short platform orientation",
    "Create your first course draft in Instructor Studio",
    "An S8 reviewer checks quality, claims, metadata and pricing",
    "Go live — set your own price and start earning",
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">Teach on S8</h1>
      <p className="mt-3 text-slate-600">
        Every approved instructor publishes their own storefront, sets the price students see, and keeps
        earnings after a transparent platform commission. S8 handles discovery, payments, refunds and
        marketplace trust so you can focus on teaching.
      </p>
      <ol className="mt-8 space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-700">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-700 text-xs font-medium text-white">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
      <Link
        href="/sign-up"
        className="mt-10 inline-block rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
      >
        Start instructor sign-up
      </Link>
    </main>
  );
}
