import type { Conversation, Reminder, Task } from "@/lib/types";

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

function headers(userId: string) {
  return { "Content-Type": "application/json", "x-user-id": userId };
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API}${path}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      let detail = "";
      try {
        detail = await res.text();
      } catch {
        detail = res.statusText;
      }
      throw new Error(`API Error (${res.status}): ${detail || res.statusText}`);
    }
    return res.json();
  } catch (err: any) {
    if (err instanceof TypeError) {
      throw new Error("Network Error: Backend is unreachable. Please ensure the server is running.");
    }
    throw err;
  }
}

export async function listConversations(userId: string): Promise<Conversation[]> {
  return apiFetch("/api/conversations", { headers: headers(userId), cache: "no-store" });
}

export async function createConversation(userId: string, transcript: string) {
  return apiFetch("/api/conversations", {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify({ transcript })
  });
}

export async function getConversation(userId: string, id: string) {
  return apiFetch(`/api/conversations/${id}`, { headers: headers(userId), cache: "no-store" });
}

export async function listTasks(userId: string): Promise<Task[]> {
  return apiFetch("/api/tasks", { headers: headers(userId), cache: "no-store" });
}

export async function createTask(
  userId: string,
  payload: { title: string; description?: string; due_date?: string; priority?: "low" | "medium" | "high" }
) {
  return apiFetch("/api/tasks", {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(payload)
  });
}

export async function patchTask(userId: string, taskId: string, payload: Partial<Task>) {
  return apiFetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: headers(userId),
    body: JSON.stringify(payload)
  });
}

export async function listReminders(userId: string): Promise<Reminder[]> {
  return apiFetch("/api/reminders", { headers: headers(userId), cache: "no-store" });
}

export async function createReminder(
  userId: string,
  payload: { title: string; body?: string; remind_at: string; source_conversation_id?: string }
) {
  return apiFetch("/api/reminders", {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(payload)
  });
}

export async function getMemoryProfile(userId: string) {
  return apiFetch("/api/memory/profile", { headers: { "x-user-id": userId }, cache: "no-store" });
}

export async function retrieveContext(userId: string, query: string) {
  return apiFetch("/api/context/retrieve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, query, limit: 5 })
  });
}

export async function getGoogleAuthUrl(userId: string) {
  return apiFetch("/api/auth/google/authorize", { headers: headers(userId) });
}

export async function getGoogleStatus(userId: string) {
  try {
    return await apiFetch("/api/auth/google/status", { headers: headers(userId), cache: "no-store" });
  } catch {
    return { connected: false };
  }
}

export async function updateGoogleSettings(userId: string, settings: any) {
  return apiFetch("/api/auth/google/settings", {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(settings)
  });
}

// Google Workspace Tools
export async function listCalendarEvents(userId: string) {
  return apiFetch("/api/google/calendar/list", { headers: headers(userId) });
}
export async function scheduleEvent(userId: string, event: any) {
  return apiFetch("/api/google/calendar/schedule", {
    method: "POST", headers: headers(userId), body: JSON.stringify(event)
  });
}
export async function searchDrive(userId: string, query: string) {
  return apiFetch(`/api/google/drive/search?query=${encodeURIComponent(query)}`, { headers: headers(userId) });
}
export async function readDriveFile(userId: string, fileId: string) {
  return apiFetch(`/api/google/drive/read?file_id=${fileId}`, { headers: headers(userId) });
}
export async function listEmails(userId: string) {
  return apiFetch("/api/google/gmail/list", { headers: headers(userId) });
}
export async function draftEmail(userId: string, email: any) {
  return apiFetch("/api/google/gmail/draft", {
    method: "POST", headers: headers(userId), body: JSON.stringify(email)
  });
}

export async function disconnectGoogle(userId: string) {
  return apiFetch("/api/auth/google/disconnect", {
    method: "POST",
    headers: headers(userId)
  });
}

