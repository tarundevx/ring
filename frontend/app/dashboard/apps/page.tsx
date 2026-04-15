"use client";

import { Box, Calendar, Mail, FileText, ChevronRight, ExternalLink } from "lucide-react";

const apps = [
  {
    id: "gcal",
    name: "Google Calendar",
    description: "Sync your schedule and manage meetings through Ring.",
    icon: Calendar,
    color: "bg-blue-500/10 text-blue-400",
    status: "Connected"
  },
  {
    id: "gdrive",
    name: "Google Drive",
    description: "Access your documents and context for better assistant knowledge.",
    icon: FileText,
    color: "bg-yellow-500/10 text-yellow-500",
    status: "Connect"
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Let Ring draft replies and summarize your important threads.",
    icon: Mail,
    color: "bg-red-500/10 text-red-400",
    status: "Connect"
  }
];

export default function AppsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">App Integrations</h1>
        <p className="text-zinc-400">Connect your digital life to make Ring more powerful.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <div 
            key={app.id} 
            className="group relative bg-ringcard border border-ringborder/50 rounded-2xl p-6 hover:border-ringaccent/30 transition-all duration-300 hover:shadow-2xl hover:shadow-ringaccent/5"
          >
            <div className={`w-12 h-12 rounded-xl ${app.color} flex items-center justify-center mb-6`}>
              <app.icon className="w-6 h-6" />
            </div>
            
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">{app.name}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              {app.description}
            </p>

            <button className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
              app.status === "Connected" 
                ? "bg-zinc-800 text-zinc-300 cursor-default" 
                : "bg-ringaccent/10 text-ringaccent hover:bg-ringaccent hover:text-white"
            }`}>
              {app.status}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10 rounded-3xl p-8 mt-12">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold text-zinc-100">Request an Integration</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Don't see your favorite tool? We're constantly adding new integrations. 
              Let us know what would make Ring better for you.
            </p>
            <button className="flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
              Submit request <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="w-full md:w-64 aspect-square bg-zinc-900/50 rounded-2xl border border-white/5 flex items-center justify-center">
            <Box className="w-12 h-12 text-zinc-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
