import { TaskKanban } from "@/components/TaskKanban";
import { listTasks } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

export default async function TasksPage() {
  const tasks = await listTasks(MOCK_USER_ID);
  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Workflow</h1>
        <p className="text-zinc-400">Manage tasks and action items extracted from your conversations.</p>
      </div>
      
      <TaskKanban initialTasks={tasks} />
    </div>
  );
}
