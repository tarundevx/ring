"use client";

import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { Mic, MicOff, Paperclip, Send, Trash2, Radio, MessageSquareDot } from "lucide-react";
import { createConversation, listConversations, getMemoryProfile, listTasks, listReminders, createReminder, createTask, retrieveContext, patchTask } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

type Message = {
  role: "assistant" | "user";
  text: string;
};

const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hey Tarun! I'm Ring — here to make your days smoother, your to-dos shorter, and your coffee breaks longer (no promises on the last one, but I'll try).\n\nWhat's on your plate today—something you want to get done, decode, or just untangle?"
    }
  ]);
  const [input, setInput] = useState("");
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
  
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptRef = useRef("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    client.on("call-start", () => setVoiceState("listening"));
    client.on("speech-start", () => setVoiceState("speaking"));
    client.on("speech-end", () => setVoiceState("processing"));

    client.on("message", (message: any) => {
      // Handle the transcript block directly
      if (message.type === "transcript" && message.transcriptType === "final") {
        const role = message.role === "user" ? "user" : "assistant";
        setMessages((prev) => [...prev, { role, text: message.transcript }]);
        
        // Append user text to transcript for saving
        if (role === "user") {
          transcriptRef.current += `\nUser: ${message.transcript}`;
        } else {
          transcriptRef.current += `\nAssistant: ${message.transcript}`;
        }
      }

      // Handle assistant's native streaming response if it sends complete text
      if (message.type === "speech-update" && message.status === "completed") {
         // Some versions of Vapi use this.
      }

      const toolCalls = message?.assistant?.model?.toolCalls || message?.toolCalls || [];
      if (Array.isArray(toolCalls) && toolCalls.length) {
        for (const toolCall of toolCalls) {
          runToolCall(toolCall).catch(() => null);
        }
      }
    });

    client.on("call-end", async () => {
      setVoiceState("idle");
      // Store conversation when call ends
      if (transcriptRef.current.trim()) {
        try {
          await createConversation(MOCK_USER_ID, transcriptRef.current);
        } catch (e) {
          console.error("Failed to store conversation", e);
        }
      }
      transcriptRef.current = "";
    });

    return () => {
      client.stop();
      vapiRef.current = null;
    };
  }, []);

  const toggleVoice = async () => {
    if (voiceState === "idle") {
      if (!vapiRef.current || !assistantId) return;
      
      let conversations: any[] = [];
      let memory: any = { profile: { facts: [] } };
      let tasks: any[] = [];
      let reminders: any[] = [];

      try {
        [conversations, memory, tasks, reminders] = await Promise.all([
          listConversations(MOCK_USER_ID), 
          getMemoryProfile(MOCK_USER_ID),
          listTasks(MOCK_USER_ID),
          listReminders(MOCK_USER_ID)
        ]);
      } catch (err) {
        console.error("Failed to load context for voice:", err);
      }

      const recentSummaries = (conversations || []).slice(0, 5).map((c, i) => `${i + 1}. ${c.summary || c.transcript.slice(0, 120)}`).join("\n");
      const memoryFacts = (memory?.profile?.facts || []).slice(0, 8).map((f: string, i: number) => `${i + 1}. ${f}`).join("\n");
      const activeTasks = (tasks || []).map(t => `- ${t.title} [Status: ${t.status}]`).join('\n');
      const upcomingReminders = (reminders || []).map(r => `- ${r.title} [Time: ${new Date(r.remind_at).toLocaleString()}]`).join('\n');
      const currentDateIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      const systemContext = `Current Date & Time: ${currentDateIST}\nRecent summaries:\n${recentSummaries || 'None'}\nFacts:\n${memoryFacts || 'None'}\nUpcoming Reminders:\n${upcomingReminders || 'None'}\nTasks:\n${activeTasks || 'None'}\n
       CRITICAL INSTRUCTIONS: Act as Ring. Keep replies extremely concise, direct, and completely in context. You are natively integrated with the user's systems (Google Calendar & To-Do app).`;
      
      await vapiRef.current.start(assistantId, { variableValues: { system_context: systemContext } });
    } else {
      vapiRef.current?.stop();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      text: "Chat cleared. What's on your plate today?"
    }]);
    transcriptRef.current = "";
  };

  const handleSendText = () => {
    if (!input.trim() || !vapiRef.current) return;
    
    // Add to UI
    setMessages(prev => [...prev, { role: "user", text: input }]);
    transcriptRef.current += `\nUser: ${input}`;
    
    // Attempt to send as a text message to Vapi if supported 
    try {
      vapiRef.current.send({
        type: "add-message",
        message: {
          role: "user",
          content: input
        }
      });
    } catch (e) {
      console.warn("Vapi doesn't support text injection cleanly in this mode or call is not active.");
    }
    
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111111]">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-ringborder/30">
        <div className="flex items-center gap-2">
          <MessageSquareDot className="w-5 h-5 text-zinc-100" />
          <h1 className="font-semibold text-zinc-100">Chat</h1>
          <button className="ml-4 px-3 py-1.5 rounded-lg bg-zinc-800/50 text-xs font-medium text-zinc-300 flex items-center gap-2 hover:bg-zinc-800 transition">
            <span className="w-2 h-2 rounded-full bg-ringaccent"></span>
            Ring v
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleVoice}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              voiceState !== "idle" ? "bg-red-500/10 text-red-400" : "bg-ringaccent/10 text-ringaccent hover:bg-ringaccent/20"
            }`}
          >
            {voiceState === "idle" ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            {voiceState === "idle" ? "Record" : "Stop"}
          </button>
          
          <button onClick={clearChat} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition">
            <Trash2 className="w-4 h-4" />
            Clear chat
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === "assistant" ? "bg-white/10" : "bg-ringaccent"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="relative">
                     <span className="w-4 h-4 block border-2 border-zinc-300 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-white">T</span>
                )}
              </div>
              
              <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                msg.role === "user" 
                  ? "bg-ringaccent text-white rounded-tr-sm" 
                  : "bg-[#191919] text-zinc-200 rounded-tl-sm border border-ringborder/50"
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.text}</p>
                {msg.role === "assistant" && i === 1 && (
                  <p className="mt-2 text-xs text-zinc-500 opacity-60">2:05 AM</p>
                )}
              </div>
            </div>
          ))}
          {voiceState !== "idle" && (
            <div className="text-center text-xs text-zinc-500 animate-pulse mt-4">
              Ring is {voiceState}...
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-ringborder/30 bg-[#111111]/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto relative flex items-end bg-[#191919] border border-ringborder rounded-2xl overflow-hidden shadow-sm focus-within:border-ringaccent/50 focus-within:ring-1 focus-within:ring-ringaccent/50 transition-all">
          
          <button className="p-3.5 text-zinc-400 hover:text-zinc-200 transition shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendText();
              }
            }}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent border-none text-zinc-100 placeholder-zinc-500 py-3.5 px-2 focus:outline-none focus:ring-0 resize-none max-h-32 min-h-[52px]"
            rows={1}
            style={{ height: input ? 'auto' : '52px' }}
          />

          <div className="p-2 flex items-center shrink-0">
            <button 
              onClick={toggleVoice}
              className={`p-2 rounded-xl transition ${voiceState !== "idle" ? 'text-red-400 bg-red-400/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSendText}
              disabled={!input.trim()}
              className="ml-1 p-2 bg-ringaccent hover:bg-ringaccenthover disabled:opacity-50 disabled:hover:bg-ringaccent text-white rounded-xl transition flex items-center justify-center w-10 h-10"
            >
               <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
        <div className="text-center mt-2">
           <span className="text-[10px] text-zinc-500 font-medium tracking-wide">Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
      
      {/* Floating global action - optional */}
      <div className="absolute bottom-6 right-6">
        <button className="w-14 h-14 bg-ringaccent hover:bg-ringaccenthover transition-colors shadow-lg rounded-full flex items-center justify-center text-white">
          <MessageSquareDot className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
