"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Task, TaskStatus } from "@/app/generated/prisma";
import { TaskKanbanView } from "./kanban-view";
import { getTasks, updateTaskStatus } from "@/app/actions/tasks/actions";
import { TasksSkeleton } from "./tasks-skeleton";

interface TasksClientProps {
  initialTasks: Task[];
  workspaceId: string;
  userId: string;
}

// Helper function to get Norwegian status labels
const getStatusLabel = (status: TaskStatus): string => {
  const statusLabels: Record<TaskStatus, string> = {
    ikke_startet: "Ikke startet",
    pabegynt: "Påbegynt",
    ferdig: "Ferdig",
  };
  return statusLabels[status];
};

export default function TasksClient({
  initialTasks,
  workspaceId,
  userId,
}: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<"all" | "mine">("all");
  const [loading, setLoading] = useState(true);

  // Set loading to false after initial mount
  useEffect(() => {
    setLoading(false);
  }, []);

  // Re-sync tasks state if initialTasks prop changes
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTasks(
          view === "mine" ? workspaceId : workspaceId,
          view === "mine" ? userId : undefined
        );
        setTasks(data);
      } catch (error) {
        console.error("Error loading tasks:", error);
        toast.error("Kunne ikke laste oppgaver");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [view, workspaceId, userId]);

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (!taskToUpdate) return;

    const oldStatus = taskToUpdate.status;
    const originalTasks = [...tasks];

    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      );

      // Call server action
      await updateTaskStatus(taskId, status, workspaceId);

      // Success toast with detailed information
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-medium">Oppgave status oppdatert</div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{taskToUpdate.title}</span> ble
            flyttet fra{" "}
            <Badge variant="outline" className="ml-1 mr-1">
              {getStatusLabel(oldStatus)}
            </Badge>
            <span>→</span>
            <Badge variant="outline" className="ml-1">
              {getStatusLabel(status)}
            </Badge>
          </div>
        </div>
      );
    } catch (error) {
      // Revert local state on error
      setTasks(originalTasks);
      console.error("Error updating task status:", error);
      toast.error("Kunne ikke oppdatere oppgave status");
    }
  };

  // Show skeleton during loading
  if (loading) {
    return (
      <div>
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as any)}
          className="mb-4"
        >
          <TabsList>
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="mine">Mine</TabsTrigger>
          </TabsList>
        </Tabs>
        <TasksSkeleton />
      </div>
    );
  }

  return (
    <div>
      <Tabs
        value={view}
        onValueChange={(v) => setView(v as any)}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="mine">Mine</TabsTrigger>
        </TabsList>
      </Tabs>
      <TaskKanbanView tasks={tasks} onStatusChange={handleStatusChange} />
    </div>
  );
}
