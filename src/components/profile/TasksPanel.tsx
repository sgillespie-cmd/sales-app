"use client";

import { useState } from "react";

export type Task = {
  id: string;
  title: string;
  status: "open" | "in_progress" | "done";
  dueAt: string | null;
};

type TasksPanelProps = {
  tasks: Task[];
};

const statusStyles: Record<Task["status"], string> = {
  open: "bg-amber-50 text-amber-700",
  in_progress: "bg-sky-50 text-sky-700",
  done: "bg-emerald-50 text-emerald-700",
};

export function TasksPanel({ tasks }: TasksPanelProps) {
  const [items, setItems] = useState(tasks);

  function toggleStatus(taskId: string) {
    setItems((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        if (task.status === "open") return { ...task, status: "in_progress" };
        if (task.status === "in_progress") return { ...task, status: "done" };
        return { ...task, status: "open" };
      }),
    );
  }

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Tasks</h2>
      <p className="text-sm text-slate-600">
        Simple starter task list. Hook this to <code>/api/venues/:id/tasks</code> for persistence.
      </p>
      <div className="space-y-2">
        {items.map((task) => (
          <div key={task.id} className="rounded-md border border-slate-200 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toggleStatus(task.id)}
                className={`rounded px-2 py-1 text-xs font-medium ${statusStyles[task.status]}`}
              >
                {task.status.replace("_", " ")}
              </button>
              <h3 className="font-medium">{task.title}</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Due: {task.dueAt ? new Date(task.dueAt).toLocaleDateString() : "No due date"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
