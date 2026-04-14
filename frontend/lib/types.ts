export type Conversation = {
  id: string;
  user_id: string;
  transcript: string;
  summary?: string;
  created_at: string;
  tags?: string[];
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date?: string;
};

export type Reminder = {
  id: string;
  title: string;
  body?: string;
  remind_at: string;
  status: "pending" | "sent" | "dismissed";
};

