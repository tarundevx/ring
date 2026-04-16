"use client";

import Vapi from "@vapi-ai/web";
import { Mic, MicOff, Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { 
  createConversation, createReminder, createTask, getMemoryProfile, listConversations, listTasks, patchTask, retrieveContext, listReminders,
  listCalendarEvents, scheduleEvent, searchDrive, readDriveFile, listEmails, draftEmail
} from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

type VoiceState = "idle" | "initializing" | "listening" | "processing" | "speaking";

const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";

export function RingVoiceButton() {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const router = useRouter();
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptRef = useRef("");
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  const runToolCall = async (toolCall: any) => {
    const name = toolCall?.function?.name || toolCall?.name;
    const argsRaw = toolCall?.function?.arguments || toolCall?.arguments || "{}";
    let args: any = {};
    try {
      args = typeof argsRaw === "string" ? JSON.parse(argsRaw || "{}") : argsRaw;
    } catch {
      args = {};
    }

    // Existing Tools
    if (name === "create_reminder") {
      await createReminder(MOCK_USER_ID, { title: args.title, body: args.body, remind_at: args.datetime || args.remind_at });
      return { ok: true };
    }
    if (name === "search_memory") {
      return retrieveContext(MOCK_USER_ID, args.query);
    }
    if (name === "create_task") {
      await createTask(MOCK_USER_ID, { title: args.title, description: args.description, due_date: args.due_date });
      return { ok: true };
    }
    
    // Google Workspace Tools
    if (name === "list_calendar_events") {
      return listCalendarEvents(MOCK_USER_ID);
    }
    if (name === "schedule_google_meeting") {
      await scheduleEvent(MOCK_USER_ID, { 
        summary: args.summary, 
        start_time: args.start_time || args.start, 
        end_time: args.end_time || args.end,
        description: args.description
      });
      return { ok: true };
    }
    if (name === "search_google_drive") {
      return searchDrive(MOCK_USER_ID, args.query);
    }
    if (name === "read_google_doc") {
      return readDriveFile(MOCK_USER_ID, args.file_id);
    }
    if (name === "read_recent_emails") {
      return listEmails(MOCK_USER_ID);
    }
    if (name === "draft_gmail_reply") {
      await draftEmail(MOCK_USER_ID, { to: args.to, subject: args.subject, body: args.body });
      return { ok: true };
    }

    if (name === "update_task_status") {
      const tasks = await listTasks(MOCK_USER_ID);
      const task = tasks.find((t) => t.id === args.task_id || t.title.toLowerCase() === String(args.title || "").toLowerCase());
      if (!task) return { ok: false, error: "task_not_found" };
      await patchTask(MOCK_USER_ID, task.id, { status: args.status });
      return { ok: true };
    }
    return { ok: false, error: "unsupported_tool" };
  };

  useEffect(() => {
    if (!publicKey) return;
    const client = new Vapi(publicKey);
    vapiRef.current = client;

    client.on("call-start", () => setState("listening"));
    client.on("speech-start", () => setState("speaking"));
    client.on("speech-end", () => setState("processing"));
    client.on("message", (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setTranscript((prev) => `${prev}\n${message.transcript}`.trim());
        transcriptRef.current = `${transcriptRef.current}\n${message.transcript}`.trim();
      }

      const toolCalls = message?.assistant?.model?.toolCalls || message?.toolCalls || [];
      if (Array.isArray(toolCalls) && toolCalls.length) {
        for (const toolCall of toolCalls) {
          runToolCall(toolCall).catch(() => null);
        }
      }
    });
    client.on("call-end", async () => {
      setState("idle");
      if (transcriptRef.current.trim()) {
        try {
          const res = await createConversation(MOCK_USER_ID, transcriptRef.current);
          if (res.ai_error_type === "rate_limit") {
            window.alert("We're receiving too many requests right now. Your conversation is saved, but AI processing is delayed. Please try again in 40 seconds.");
          } else if (res.ai_error_type === "other") {
            window.alert("AI extraction failed due to a server error. Your transcript was saved.");
          }
          router.refresh();
        } catch (err: any) {
          console.error("Failed to store conversation", err);
          window.alert(err.message);
        }
      }
      setTranscript("");
      transcriptRef.current = "";
    });

    return () => {
      client.stop();
      vapiRef.current = null;
    };
  }, []);

  const startCall = async () => {
    if (!vapiRef.current || !assistantId) return;
    setState("initializing");
    
    let conversations: any[] = [];
    let memory: any = { profile: { facts: [] } };
    let tasks: any[] = [];
    let reminders: any[] = [];
    let googleEvents: any = { events: [] };
    let googleEmails: any = { emails: [] };

    try {
      [conversations, memory, tasks, reminders, googleEvents, googleEmails] = await Promise.all([
        listConversations(MOCK_USER_ID), 
        getMemoryProfile(MOCK_USER_ID),
        listTasks(MOCK_USER_ID),
        listReminders(MOCK_USER_ID),
        listCalendarEvents(MOCK_USER_ID).catch(() => ({ events: [] })),
        listEmails(MOCK_USER_ID).catch(() => ({ emails: [] }))
      ]);
    } catch (err) {
      console.error("Failed to load context for voice:", err);
    }

    const recentSummaries = (conversations || [])
      .slice(0, 5)
      .map((c, i) => `${i + 1}. ${c.summary || c.transcript.slice(0, 120)}`)
      .join("\n");
      
    const memoryFacts = (memory?.profile?.facts || []).slice(0, 8).map((f: string, i: number) => `${i + 1}. ${f}`).join("\n");
    const activeTasks = (tasks || []).filter(t => t.status !== 'done').map(t => `- ${t.title}`).join('\n');
    
    const calendarEvents = (googleEvents?.events || []).map((e: any) => `- ${e.summary} at ${new Date(e.start.dateTime || e.start.date).toLocaleString()}`).join('\n');
    const recentEmails = (googleEmails?.emails || []).map((m: any) => `- FROM: ${m.from || 'Unknown'} | SUBJECT: ${m.subject}`).join('\n');

    const currentDateIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const systemContext = `Current Date & Time (IST): ${currentDateIST}
    
Recent conversation summaries:\n${recentSummaries || 'None'}\n\nTop memory facts:\n${memoryFacts || 'None'}\n

Google Calendar (Upcoming Events):
${calendarEvents || 'No upcoming events found.'}

Gmail (Recent Threads):
${recentEmails || 'No recent emails found.'}

Active Internal Tasks:
${activeTasks || 'None currently.'}

CRITICAL INSTRUCTIONS FOR YOU (THE ASSISTANT):
1. You are natively integrated with Google Workspace (Calendar, Drive, Gmail). You CAN read and schedule meetings, search documents, and read/draft emails.
2. If the user asks about their schedule or emails, use the provided context above.
3. NEVER say you are a text-based AI. You are Ring, their proactive assistant.
4. If asked to schedule a meeting, use 'schedule_google_meeting'.
5. If asked to find information in their documents, use 'search_google_drive'.
6. If asked to reply to an email, use 'draft_gmail_reply'.
7. Keep replies concise and direct, maintaining the persona of a high-end digital soulmate.`;

    await vapiRef.current.start(assistantId, {
      variableValues: {
        system_context: systemContext
      }
    });
  };

  const stopCall = async () => {
    if (!vapiRef.current) return;
    await vapiRef.current.stop();
  };

  return (
    <div className="flex flex-col items-center gap-12">
      <button
        onClick={state === "idle" ? startCall : stopCall}
        className="relative w-48 h-48 flex items-center justify-center group outline-none"
        aria-label="Ring voice call"
        disabled={state === "initializing"}
      >
        {/* Doppler Effect Layers - Trigger only when AI speaks */}
        {state === "speaking" && (
          <>
            <div className="absolute inset-0 rounded-full bg-ringaccent/20 animate-ping duration-[2000ms]" />
            <div className="absolute inset-4 rounded-full bg-ringaccent/30 animate-ping duration-[2500ms]" />
            <div className="absolute inset-8 rounded-full bg-ringaccent/40 animate-ping duration-[3000ms]" />
          </>
        )}

        {/* Concentric Circle Shapes using Divs */}
        <div className={`relative z-10 w-full h-full flex items-center justify-center transition-transform duration-700 ${state !== "idle" ? 'scale-110' : 'group-hover:scale-105'}`}>
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Outer Ring */}
            <div className={`absolute inset-0 rounded-full border-[3px] border-emerald-400/20 ${state === "speaking" ? "animate-doppler" : ""}`} style={{ animationDelay: '0.6s' }} />
            {/* Third Ring */}
            <div className={`absolute inset-4 rounded-full border-[3px] border-emerald-500/40 ${state === "speaking" ? "animate-doppler" : ""}`} style={{ animationDelay: '0.4s' }} />
            {/* Second Ring */}
            <div className={`absolute inset-8 rounded-full border-[3px] border-emerald-500/60 ${state === "speaking" ? "animate-doppler" : ""}`} style={{ animationDelay: '0.2s' }} />
            {/* Inner Ring */}
            <div className={`absolute inset-12 rounded-full border-[3px] border-emerald-600/80 ${state === "speaking" ? "animate-doppler" : ""}`} />
            
            {/* Center Core */}
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.5)] ${(state !== "idle" && state !== "initializing") ? "animate-pulse" : (state === "initializing" ? "animate-spin" : "")}`} />
          </div>
        </div>
      </button>

      {state !== "idle" && (
        <div className="w-[440px] rounded-[32px] bg-ringcard/80 backdrop-blur-xl border border-white/5 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-ringaccent animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1 h-3 bg-ringaccent animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-3 bg-ringaccent animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">{state}</p>
          </div>
          <div ref={transcriptContainerRef} className="max-h-64 overflow-hidden whitespace-pre-wrap text-[16px] leading-relaxed text-zinc-100 font-serif italic pr-4">
            <style>{`
              @keyframes wordFadeIn {
                from { opacity: 0; transform: translateY(4px); filter: blur(4px); }
                to { opacity: 1; transform: translateY(0); filter: blur(0); }
              }
              .animate-word {
                animation: wordFadeIn 0.4s ease-out forwards;
              }
            `}</style>
            {transcript ? (
              <div className="space-y-6">
                {transcript.split(/[.!?]+\s/).filter(s => s.trim()).map((sentence, sIdx, sentences) => {
                  const isLast = sIdx === sentences.length - 1;
                  return (
                    <p key={sIdx} className={`transition-all duration-700 ${!isLast ? 'opacity-20 blur-[2px] scale-95' : 'opacity-100 blur-0 scale-100'}`}>
                      {sentence.split(' ').map((word, wIdx) => (
                        <span 
                          key={wIdx} 
                          className="inline-block mr-1.5 animate-word"
                          style={{ animationDelay: `${wIdx * 0.04}s` }}
                        >
                          {word}
                        </span>
                      ))}
                      {sIdx < sentences.length - 1 && "."}
                    </p>
                  );
                })}
              </div>
            ) : state === "initializing" ? (
              <div className="flex items-center gap-3 text-emerald-500 italic">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                Connecting to Ring systems...
              </div>
            ) : (
              <div className="flex items-center gap-3 text-zinc-500 italic opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" />
                Speak freely, I'm listening...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

