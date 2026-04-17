import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#090909] text-zinc-300 p-8 md:p-24 max-w-4xl mx-auto space-y-12">
      <Link href="/" className="text-zinc-500 hover:text-white transition-colors">← Back to home</Link>
      
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-tight">Terms of Service</h1>
        <p className="text-sm text-zinc-500 italic">Last updated: April 17, 2024</p>
      </header>

      <section className="space-y-6 leading-relaxed">
        <p>
          By using Ring AI, you agree to the following terms and conditions.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">1. Use of Service</h2>
        <p>
          You must be at least 18 years old to use this service. You agree to use Ring AI only for lawful purposes and in accordance with these Terms.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">2. Account Responsibility</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">3. Limitation of Liability</h2>
        <p>
          Ring AI is provided "as is" without warranty of any kind. We are not liable for any damages arising from your use of the service or any errors in AI-generated content.
        </p>
      </section>

      <footer className="pt-24 text-center text-zinc-600 text-sm">
        &copy; 2024 Ring AI. All rights reserved.
      </footer>
    </div>
  );
}
