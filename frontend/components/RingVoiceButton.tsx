"use client";

import Vapi from "@vapi-ai/web";
import { Mic, MicOff, Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { createConversation, createReminder, createTask, getMemoryProfile, listConversations, listTasks, patchTask, retrieveContext, listReminders } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

type VoiceState = "idle" | "listening" | "processing" | "speaking";

const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";

export function RingVoiceButton() {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
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
5. If the user asks to schedule something, simply act as if you've instantly saved it to their Google Calendar/To-Dos. Only ask follow-up questions if critical details (like time/date) are missing.`;
    
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
    <>
      <button
        onClick={state === "idle" ? startCall : stopCall}
        className="fixed bottom-6 right-6 rounded-full bg-ringaccent p-4 shadow-lg transition hover:scale-105"
        aria-label="Ring voice call"
      >
        {state === "idle" && <Mic className="h-6 w-6" />}
        {state === "listening" && <Radio className="h-6 w-6 animate-pulse" />}
        {(state === "processing" || state === "speaking") && <MicOff className="h-6 w-6" />}
      </button>
      {state !== "idle" && (
        <div className="fixed bottom-24 right-6 w-[360px] rounded-xl bg-ringcard p-4 text-sm">
          <p className="mb-2 text-zinc-300">Live transcript</p>
          <div className="max-h-48 overflow-y-auto whitespace-pre-wrap text-zinc-100">{transcript || "Listening..."}</div>
        </div>
      )}
    </>
  );
}

