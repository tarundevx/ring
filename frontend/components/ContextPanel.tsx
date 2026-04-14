type ContextPanelProps = { matches: Array<{ text: string; score: number }> };

export function ContextPanel({ matches }: ContextPanelProps) {
  return (
    <aside className="rounded-xl bg-ringcard p-4">
      <h2 className="mb-3 text-sm font-semibold">Why Ring knows this</h2>
      <div className="space-y-2">
        {matches.map((m, i) => (
          <div key={i} className="rounded bg-zinc-800 p-2 text-xs">
            <p className="text-zinc-400">Score: {m.score.toFixed(3)}</p>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

