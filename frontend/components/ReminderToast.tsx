"use client";

import { useEffect, useState } from "react";

import { MOCK_USER_ID } from "@/lib/user";

type ReminderEvent = {
  type: "reminder";
  reminder_id: string;
  title: string;
  remind_at: string;
};

export function ReminderToast() {
  const [event, setEvent] = useState<ReminderEvent | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const wsUrl = base.replace("http", "ws") + `/api/ws/notifications/${MOCK_USER_ID}`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (message) => {
      const data = JSON.parse(message.data) as ReminderEvent;
      if (data.type === "reminder") setEvent(data);
    };
    return () => ws.close();
  }, []);

  if (!event) return null;
  return (
    <div className="fixed right-6 top-6 rounded-lg border border-ringaccent bg-ringcard p-4 shadow-xl">
      <p className="text-sm font-semibold">Reminder</p>
      <p className="text-sm">{event.title}</p>
    </div>
  );
}

