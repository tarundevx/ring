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
  { key: "done", label: "Completed" }
];

export function TaskKanban({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks.filter(t => t.status !== "done"));
  
  const grouped = useMemo(
    () => columns.map((col) => ({ ...col, tasks: tasks.filter((t) => t.status === col.key) })),
    [tasks]
  );

  const handleFinish = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await patchTask(MOCK_USER_ID, taskId, { status: "done" });
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const taskId = event.active.id as string;
    const over = event.over?.id as Task["status"] | undefined;
    if (!over) return;
    
    if (over === "done") {
       handleFinish(taskId);
       return;
    }

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: over } : t)));
    await patchTask(MOCK_USER_ID, taskId, { status: over });
  };

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {grouped.map((col) => (
          <DropColumn key={col.key} id={col.key} title={col.label}>
            <div className="space-y-3">
              {col.tasks.map((task) => (
                <DraggableTask key={task.id} task={task} onFinish={() => handleFinish(task.id)} />
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
    <div ref={setNodeRef} id={id} className={`rounded-3xl p-6 border-2 border-dashed transition-colors ${isOver ? "bg-zinc-800/50 border-ringaccent/50" : "bg-ringcard border-white/5"}`}>
      <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">{title}</h3>
      {children}
    </div>
  );
}

function DraggableTask({ task, onFinish }: { task: Task; onFinish: () => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  
  return (
    <div ref={setNodeRef} style={style} className="group relative rounded-2xl bg-zinc-900 border border-white/5 p-4 shadow-xl">
      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing mb-2">
        <p className="text-sm font-medium text-zinc-200">{task.title}</p>
        {task.description && <p className="mt-1 text-xs text-zinc-500 line-clamp-1">{task.description}</p>}
      </div>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onFinish(); }}
        className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-green-500 transition-colors bg-black/20 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100"
      >
        Done
      </button>
    </div>
  );
}

