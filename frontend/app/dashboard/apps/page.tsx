"use client";

import { useEffect, useState } from "react";
import { Calendar, Mail, FileText, ChevronRight, Check, AlertCircle } from "lucide-react";
import { getGoogleAuthUrl, getGoogleStatus, updateGoogleSettings, disconnectGoogle } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

export default function AppsPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getGoogleStatus(MOCK_USER_ID);
        setStatus(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleConnect = async () => {
    try {
      const { url } = await getGoogleAuthUrl(MOCK_USER_ID);
      window.location.href = url;
    } catch (err) {
      alert("Failed to initiate Google connection");
    }
  };

  const onDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Google Workspace?")) return;
    await disconnectGoogle(MOCK_USER_ID);
    setStatus({ connected: false });
  };

  const toggleSetting = async (key: string) => {
    const newVal = !status[key];
    setStatus({ ...status, [key]: newVal });
    await updateGoogleSettings(MOCK_USER_ID, { [key]: newVal ? 1 : 0 });
  };

  if (loading) return <div className="p-8 text-zinc-500">Loading integrations...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 italic font-serif">Workspace Integrations</h1>
        <p className="text-zinc-400">Manage how Ring interacts with your Google accounts.</p>
      </header>

      {/* Connection Card */}
      <div className="bg-ringcard border border-ringborder/50 rounded-[32px] p-8 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-ringaccent/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative">
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-zinc-900 rounded-2xl border border-white/5">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                   <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                   <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                   <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                   <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">Google Workspace</h2>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  {status?.connected ? "Securely Connected" : "Not Linked"}
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Enable Ring to access your calendar, files, and emails. We use industry-standard OAuth 2.0 to ensure your data stays private and secure.
            </p>
          </div>

          {!status?.connected ? (
            <button 
              onClick={handleConnect}
              className="px-8 py-3 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform active:scale-95"
            >
              Link Account
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-6 py-3 bg-green-500/10 text-green-500 rounded-2xl border border-green-500/20">
                <Check className="w-5 h-5" />
                <span className="font-bold">Active</span>
              </div>
              <button 
                onClick={onDisconnect}
                className="text-xs font-bold text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-widest text-center"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {status?.connected && (
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { key: "enabled_calendar", icon: Calendar, label: "Calendar", desc: "List & Schedule Events" },
              { key: "enabled_drive", icon: FileText, label: "Drive", desc: "Search & Read Docs" },
              { key: "enabled_mail", icon: Mail, label: "Gmail", desc: "Read & Draft Replies" },
            ].map((srv) => (
              <div key={srv.key} className="p-6 bg-zinc-900/50 rounded-3xl border border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <srv.icon className="w-5 h-5 text-zinc-300" />
                  </div>
                  <button 
                    onClick={() => toggleSetting(srv.key)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${status[srv.key] ? 'bg-ringaccent' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${status[srv.key] ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100">{srv.label}</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">{srv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!status?.connected && (
        <div className="flex gap-4 p-6 bg-blue-500/5 border border-blue-500/10 rounded-[28px] text-blue-400">
           <AlertCircle className="w-6 h-6 flex-shrink-0" />
           <div className="space-y-1">
             <p className="text-sm font-bold">Heads up!</p>
             <p className="text-xs leading-relaxed opacity-80">
               Integrating your workspace allows Ring to automatically resolve dates, find relevant files during conversations, and help you draft emails without context-switching.
             </p>
           </div>
        </div>
      )}
    </div>
  );
}
