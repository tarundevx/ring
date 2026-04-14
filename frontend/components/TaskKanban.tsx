"use client";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";

import { patchTask } from "@/lib/api";
import type { Task } from "@/lib/types";
import { MOCK_USER_ID } from "@/lib/user";

const columns: Array<{ key: Task["status"]; label: string }> = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" }
];

export function TaskKanban({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const grouped = useMemo(
    () => columns.map((col) => ({ ...col, tasks: tasks.filter((t) => t.status === col.key) })),
    [tasks]
  );

  const onDragEnd = async (event: DragEndEvent) => {
    const taskId = event.active.id as string;
    const over = event.over?.id as Task["status"] | undefined;
    if (!over) return;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: over } : t)));
    await patchTask(MOCK_USER_ID, taskId, { status: over });
  };

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {grouped.map((col) => (
          <DropColumn key={col.key} id={col.key} title={col.label}>
            <div className="space-y-2">
              {col.tasks.map((task) => (
                <DraggableTask key={task.id} task={task} />
              ))}
            </div>
          </DropColumn>
        ))}
      </div>
    </DndContext>
  );
}

function DropColumn({ id, title, children }: { id: Task["status"]; title: string; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} id={id} className={`rounded-xl p-3 ${isOver ? "bg-zinc-700" : "bg-ringcard"}`}>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="rounded-lg bg-zinc-800 p-3">
      <p>{task.title}</p>
      {task.description && <p className="mt-1 text-xs text-zinc-400">{task.description}</p>}
    </div>
  );
}

