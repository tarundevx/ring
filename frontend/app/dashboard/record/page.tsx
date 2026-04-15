"use client";

import { RingVoiceButton } from "@/components/RingVoiceButton";

export default function RecordPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[80vh] space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Record a Conversation</h1>
        <p className="text-zinc-400">Tap the microphone to start recording with Ring.</p>
      </div>
      
      <div className="relative">
        <RingVoiceButton />
      </div>

      <div className="max-w-md text-center text-xs text-zinc-500 leading-relaxed">
        Ring will automatically transcribe your conversation, identify action items, and store memories for you.
      </div>
    </div>
  );
}
