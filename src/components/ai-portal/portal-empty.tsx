export function PortalEmpty({ title, blurb, note }: { title: string; blurb: string; note: string }) {
  return (
    <div>
      <h1 className="text-xl font-bold text-s8-navy sm:text-2xl">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{blurb}</p>
      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-s8-mint text-xl text-s8-teal-dark">
          ✦
        </span>
        <p className="mt-4 text-sm text-slate-600">{note}</p>
      </div>
    </div>
  );
}
