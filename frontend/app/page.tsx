import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-5xl font-bold">Ring</h1>
      <p className="mt-4 max-w-xl text-zinc-300">Voice-first knowledge and workflow agent.</p>
      <Link href="/dashboard" className="mt-8 rounded-lg bg-ringaccent px-6 py-3">
        Enter dashboard
      </Link>
    </div>
  );
}

