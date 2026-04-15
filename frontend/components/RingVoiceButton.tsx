"use client";

import Vapi from "@vapi-ai/web";
import { Mic, MicOff, Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createConversation, createReminder, createTask, getMemoryProfile, listConversations, listTasks, patchTask, retrieveContext, listReminders } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

type VoiceState = "idle" | "listening" | "processing" | "speaking";

const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";

export function RingVoiceButton() {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const router = useRouter();
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptRef = useRef("");

  const runToolCall = async (toolCall: any) => {
    const name = toolCall?.function?.name || toolCall?.name;
    const argsRaw = toolCall?.function?.arguments || toolCall?.arguments || "{}";
    let args: any = {};
    try {
      args = typeof argsRaw === "string" ? JSON.parse(argsRaw || "{}") : argsRaw;
    } catch {
      args = {};
    }

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
        await createConversation(MOCK_USER_ID, transcriptRef.current);
        router.refresh();
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
    const [conversations, memory, tasks, reminders] = await Promise.all([
      listConversations(MOCK_USER_ID), 
      getMemoryProfile(MOCK_USER_ID),
      listTasks(MOCK_USER_ID),
      listReminders(MOCK_USER_ID)
    ]);
    const recentSummaries = conversations
      .slice(0, 5)
      .map((c, i) => `${i + 1}. ${c.summary || c.transcript.slice(0, 120)}`)
      .join("\n");
    const memoryFacts = (memory?.profile?.facts || []).slice(0, 8).map((f: string, i: number) => `${i + 1}. ${f}`).join("\n");
    
    const activeTasks = tasks.map(t => `- ${t.title} [Status: ${t.status}]`).join('\n');
    const upcomingReminders = reminders.map(r => `- ${r.title} [Time: ${new Date(r.remind_at).toLocaleString()}]`).join('\n');

    const currentDateIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const systemContext = `Current Date & Time (IST): ${currentDateIST}
    
Recent conversation summaries:\n${recentSummaries}\n\nTop memory facts:\n${memoryFacts}\n
Upcoming Calendar Events & Reminders:
${upcomingReminders || 'None currently.'}

Active To-Dos:
${activeTasks || 'None currently.'}

CRITICAL INSTRUCTIONS FOR YOU (THE ASSISTANT):
1. You are natively integrated with the user's systems (Google Calendar & To-Do app). You CAN read and schedule reminders, meetings, and tasks immediately.
2. If the user asks about upcoming events or reminders, read them directly from the provided list in your context above.
3. NEVER say you are a text-based AI. NEVER tell the user to check their own phone or app. Do not give disclaimers about not having access.
4. Keep replies extremely concise, direct, and completely in context. No out-of-context replies.
5. If the user asks to schedule something, simply act as if you've instantly saved it to their Google Calendar/To-Dos. Only ask follow-up questions if critical details (like time/date) are missing. You are Ring.`;
    
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
            <div className={`absolute inset-0 rounded-full border-[3px] border-blue-500/20 ${state === "speaking" ? "animate-doppler" : ""}`} style={{ animationDelay: '0.6s' }} />
            {/* Third Ring */}
            <div className={`absolute inset-4 rounded-full border-[3px] border-purple-500/40 ${state === "speaking" ? "animate-doppler" : ""}`} style={{ animationDelay: '0.4s' }} />
            {/* Second Ring */}
            <div className={`absolute inset-8 rounded-full border-[3px] border-blue-600/60 ${state === "speaking" ? "animate-doppler" : ""}`} style={{ animationDelay: '0.2s' }} />
            {/* Inner Ring */}
            <div className={`absolute inset-12 rounded-full border-[3px] border-purple-600/80 ${state === "speaking" ? "animate-doppler" : ""}`} />
            
            {/* Center Core */}
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_20px_rgba(37,99,235,0.5)] ${state !== "idle" ? "animate-pulse" : ""}`} />
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
          <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-[16px] leading-relaxed text-zinc-100 scrollbar-hide font-serif italic">
            {transcript || "Speak freely..."}
          </div>
        </div>
      )}
    </div>
  );
}

