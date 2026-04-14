import { TaskKanban } from "@/components/TaskKanban";
import { listTasks } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

export default async function TasksPage() {
  const tasks = await listTasks(MOCK_USER_ID);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Workflow Board</h1>
      <TaskKanban initialTasks={tasks} />
    </div>
  );
}

