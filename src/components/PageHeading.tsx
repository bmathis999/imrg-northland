export function PageHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-14 pb-8 sm:px-6 sm:pt-20">
      {eyebrow && <p className="text-sm uppercase tracking-[0.2em] text-orange">{eyebrow}</p>}
      <h1 className="display mt-3 text-[clamp(2rem,6vw,3.4rem)]">{title}</h1>
      <div className="mt-5 h-px w-16 bg-orange" />
      {children && <div className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed">{children}</div>}
    </div>
  );
}
