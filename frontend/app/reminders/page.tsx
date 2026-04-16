export const dynamic = "force-dynamic";
import { listReminders } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

export default async function RemindersPage() {
  let reminders: any[] = [];
  try {
    reminders = await listReminders(MOCK_USER_ID);
  } catch (err) {
    console.error("Failed to load reminders:", err);
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Reminders</h1>
      {reminders.length === 0 ? (
        <p className="text-muted-foreground">No reminders found or failed to load.</p>
      ) : (
        reminders.map((r) => (
          <div key={r.id} className="rounded-xl bg-ringcard p-4">
            <p className="font-semibold">{r.title}</p>
            <p className="text-sm text-zinc-400">{new Date(r.remind_at).toLocaleString()}</p>
            {r.body && <p className="mt-2 text-sm">{r.body}</p>}
          </div>
        ))
      )}
    </div>
  );
}

