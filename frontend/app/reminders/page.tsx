import { listReminders } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

export default async function RemindersPage() {
  const reminders = await listReminders(MOCK_USER_ID);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Reminders</h1>
      {reminders.map((r) => (
        <div key={r.id} className="rounded-xl bg-ringcard p-4">
          <p className="font-semibold">{r.title}</p>
          <p className="text-sm text-zinc-400">{new Date(r.remind_at).toLocaleString()}</p>
          {r.body && <p className="mt-2 text-sm">{r.body}</p>}
        </div>
      ))}
    </div>
  );
}

