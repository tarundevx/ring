type MemoryGraphProps = { profile: Record<string, unknown> };

export function MemoryGraph({ profile }: MemoryGraphProps) {
  return (
    <div className="rounded-xl bg-ringcard p-4">
      <h2 className="mb-3 text-lg font-semibold">Memory Graph</h2>
      <pre className="overflow-x-auto text-xs text-zinc-300">{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
}

