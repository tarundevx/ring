import type { Conversation, Reminder, Task } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function headers(userId: string) {
  return { "Content-Type": "application/json", "x-user-id": userId };
}

export async function listConversations(userId: string): Promise<Conversation[]> {
  const res = await fetch(`${API}/api/conversations`, { headers: headers(userId), cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load conversations");
  return res.json();
}

export async function createConversation(userId: string, transcript: string) {
  const res = await fetch(`${API}/api/conversations`, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify({ transcript })
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}

export async function getConversation(userId: string, id: string) {
  const res = await fetch(`${API}/api/conversations/${id}`, { headers: headers(userId), cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load conversation");
  return res.json();
}

export async function listTasks(userId: string): Promise<Task[]> {
  const res = await fetch(`${API}/api/tasks`, { headers: headers(userId), cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load tasks");
  return res.json();
}

export async function createTask(
  userId: string,
  payload: { title: string; description?: string; due_date?: string; priority?: "low" | "medium" | "high" }
) {
  const res = await fetch(`${API}/api/tasks`, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function patchTask(userId: string, taskId: string, payload: Partial<Task>) {
  const res = await fetch(`${API}/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: headers(userId),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function listReminders(userId: string): Promise<Reminder[]> {
  const res = await fetch(`${API}/api/reminders`, { headers: headers(userId), cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load reminders");
  return res.json();
}

export async function createReminder(
  userId: string,
  payload: { title: string; body?: string; remind_at: string; source_conversation_id?: string }
) {
  const res = await fetch(`${API}/api/reminders`, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to create reminder");
  return res.json();
}

export async function getMemoryProfile(userId: string) {
  const res = await fetch(`${API}/api/memory/profile`, { headers: { "x-user-id": userId }, cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load memory profile");
  return res.json();
}

export async function retrieveContext(userId: string, query: string) {
  const res = await fetch(`${API}/api/context/retrieve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, query, limit: 5 })
  });
  if (!res.ok) throw new Error("Failed to retrieve context");
  return res.json();
}

export async function getGoogleAuthUrl(userId: string) {
  const res = await fetch(`${API}/api/auth/google/authorize`, { headers: headers(userId) });
  return res.json();
}

export async function getGoogleStatus(userId: string) {
  try {
    const res = await fetch(`${API}/api/auth/google/status`, { headers: headers(userId), cache: "no-store" });
    if (!res.ok) return { connected: false };
    return res.json();
  } catch {
    return { connected: false };
  }
}

export async function updateGoogleSettings(userId: string, settings: any) {
  const res = await fetch(`${API}/api/auth/google/settings`, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(settings)
  });
  return res.json();
}

// Google Workspace Tools
export async function listCalendarEvents(userId: string) {
  const res = await fetch(`${API}/api/google/calendar/list`, { headers: headers(userId) });
  return res.json();
}
export async function scheduleEvent(userId: string, event: any) {
  return fetch(`${API}/api/google/calendar/schedule`, {
    method: "POST", headers: headers(userId), body: JSON.stringify(event)
  }).then(r => r.json());
}
export async function searchDrive(userId: string, query: string) {
  const res = await fetch(`${API}/api/google/drive/search?query=${encodeURIComponent(query)}`, { headers: headers(userId) });
  return res.json();
}
export async function readDriveFile(userId: string, fileId: string) {
  const res = await fetch(`${API}/api/google/drive/read?file_id=${fileId}`, { headers: headers(userId) });
  return res.json();
}
export async function listEmails(userId: string) {
  const res = await fetch(`${API}/api/google/gmail/list`, { headers: headers(userId) });
  return res.json();
}
export async function draftEmail(userId: string, email: any) {
  return fetch(`${API}/api/google/gmail/draft`, {
    method: "POST", headers: headers(userId), body: JSON.stringify(email)
  }).then(r => r.json());
}

export async function disconnectGoogle(userId: string) {
  const res = await fetch(`${API}/api/auth/google/disconnect`, {
    method: "POST",
    headers: headers(userId)
  });
  return res.json();
}

