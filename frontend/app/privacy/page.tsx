import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#090909] text-zinc-300 p-8 md:p-24 max-w-4xl mx-auto space-y-12">
      <Link href="/" className="text-zinc-500 hover:text-white transition-colors">← Back to home</Link>
      
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 italic">Last updated: April 17, 2024</p>
      </header>

      <section className="space-y-6 leading-relaxed">
        <p>
          At Ring AI, we take your privacy seriously. This policy outlines how we handle your data when you use our voice-first assistant.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">1. Data Collection</h2>
        <p>
          We collect voice transcripts, extracted tasks, and reminders to provide our services. When you connect Google Workspace, we access your calendar and emails only to perform actions you explicitly request.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">2. Data Security</h2>
        <p>
          All data is encrypted in transit and at rest. We use industry-standard OAuth 2.0 for third-party integrations, ensuring we never store your passwords.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">3. Data Sharing</h2>
        <p>
          We do not sell your personal data to third parties. Data is only shared with service providers (like Vapi or Google) as necessary to provide the assistant's functionality.
        </p>
      </section>

      <footer className="pt-24 text-center text-zinc-600 text-sm">
        &copy; 2024 Ring AI. All rights reserved.
      </footer>
    </div>
  );
}
