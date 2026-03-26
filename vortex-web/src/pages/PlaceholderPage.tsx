export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="border-2 border-white/10 bg-black/40 p-8">
      <h1 className="font-display text-6xl md:text-8xl tracking-tighter text-primary">{title}</h1>
      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-white/40">
        UI port in progress.
      </p>
    </div>
  )
}

