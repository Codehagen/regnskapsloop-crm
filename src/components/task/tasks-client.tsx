"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task, TaskStatus } from "@/app/generated/prisma";
import { TaskKanbanView } from "./kanban-view";
import { getTasks, updateTaskStatus } from "@/app/actions/tasks/actions";

interface TasksClientProps {
  initialTasks: Task[];
  workspaceId: string;
  userId: string;
}

export default function TasksClient({ initialTasks, workspaceId, userId }: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<"all" | "mine">("all");

  useEffect(() => {
    const load = async () => {
      const data = await getTasks(view === "mine" ? workspaceId : workspaceId, view === "mine" ? userId : undefined);
      setTasks(data);
    };
    load();
  }, [view, workspaceId, userId]);

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    try {
      await updateTaskStatus(taskId, status, workspaceId);
    } catch (e) {
      // revert on error
    }
  };

  return (
    <div>
      <Tabs value={view} onValueChange={(v) => setView(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="mine">Mine</TabsTrigger>
        </TabsList>
      </Tabs>
      <TaskKanbanView tasks={tasks} onStatusChange={handleStatusChange} />
    </div>
  );
}
