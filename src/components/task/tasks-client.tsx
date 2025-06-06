"use client";

import { useState, useEffect, useTransition } from "react";
import { IconSearch, IconLayoutGrid, IconTable } from "@tabler/icons-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Task, TaskStatus } from "@/app/generated/prisma";
import { TaskKanbanView } from "./kanban-view";
import { DataTable } from "@/components/lead/data-table";
import { taskColumns } from "./columns";
import { getTasks, updateTaskStatus } from "@/app/actions/tasks/actions";
import { searchTasksAction } from "@/app/actions/tasks/searchTasksAction";
import { TasksSkeleton } from "./tasks-skeleton";
import { TaskEmptyState } from "./empty-state";
import { TaskModal } from "./add-task-modal";

// Extended Task type that includes assignees and business
type TaskWithRelations = Task & {
  assignees: { id: string; name: string | null; email: string }[];
  business?: { id: string; name: string } | null;
};

interface TasksClientProps {
  initialTasks: TaskWithRelations[];
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
  const [tasks, setTasks] = useState<TaskWithRelations[]>(initialTasks);
  const [view, setView] = useState<"all" | "mine">("all");
  const [displayView, setDisplayView] = useState<"table" | "kanban">("kanban");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  // Task modal state
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<
    TaskWithRelations | undefined
  >(undefined);

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
      if (searchTerm) return; // Don't reload if we have a search term

      setLoading(true);
      try {
        const data = await getTasks(
          view === "mine" ? workspaceId : workspaceId,
          view === "mine" ? userId : undefined
        );
        setTasks(data as TaskWithRelations[]);
      } catch (error) {
        console.error("Error loading tasks:", error);
        toast.error("Kunne ikke laste oppgaver");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [view, workspaceId, userId, searchTerm]);

  // Function to refresh tasks after updates
  const refreshTasks = async () => {
    try {
      const data = await getTasks(
        view === "mine" ? workspaceId : workspaceId,
        view === "mine" ? userId : undefined
      );
      setTasks(data as TaskWithRelations[]);
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    }
  };

  // Function to handle task click (open edit modal)
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task as TaskWithRelations);
    setEditTaskModalOpen(true);
  };

  // Function to handle search
  const handleSearch = () => {
    startTransition(async () => {
      try {
        const searchResults = await searchTasksAction(
          searchTerm,
          view === "mine" ? userId : undefined
        );
        setTasks(searchResults as TaskWithRelations[]);
        if (searchResults.length === 0 && searchTerm !== "") {
          toast.info(`Ingen oppgaver funnet for "${searchTerm}".`);
        }
      } catch (error) {
        console.error("Search failed:", error);
        toast.error("Søk feilet. Prøv igjen.");
      }
    });
  };

  // Function to trigger the 'Add Task' modal
  const handleAddNewTask = () => {
    // This will be handled by the AddTaskButtonWrapper in the parent component
    toast.info(
      "Bruk 'Ny Oppgave' knappen oppe til høyre for å legge til en oppgave."
    );
  };

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

  // Determine content based on state
  const renderContent = () => {
    // Show initial skeleton on mount
    if (loading) {
      return <TasksSkeleton />;
    }

    // Show skeleton loader while search is pending
    if (isPending) {
      return <TasksSkeleton />;
    }

    // Handle empty state after search
    if (tasks.length === 0 && searchTerm !== "") {
      return (
        <TaskEmptyState
          title={`Ingen resultater for "${searchTerm}"`}
          description="Prøv et annet søkeord eller tøm søkefeltet for å se alle oppgaver."
        />
      );
    }

    // Handle initial empty state (no tasks in the workspace at all)
    if (tasks.length === 0 && searchTerm === "") {
      return (
        <TaskEmptyState
          title="Ingen oppgaver funnet"
          description="Kom i gang ved å legge til din første oppgave."
          actionLabel="Opprett oppgave"
          onAction={handleAddNewTask}
        />
      );
    }

    if (displayView === "table") {
      return (
        <DataTable
          columns={taskColumns}
          data={tasks}
          searchColumn="title"
          searchPlaceholder="Søk etter tittel..."
        />
      );
    }

    if (displayView === "kanban") {
      return (
        <TaskKanbanView
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onTaskClick={handleTaskClick}
        />
      );
    }

    return null;
  };

  return (
    <div>
      {/* Top controls: Search and View Switchers */}
      <div className="flex items-center justify-between mb-6">
        {/* Search Input */}
        <div className="flex items-center w-full max-w-sm">
          <Input
            placeholder="Søk etter oppgaver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="mr-2"
            disabled={isPending}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleSearch}
            disabled={isPending}
          >
            <IconSearch size={16} />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* View Display Switcher (Table/Kanban) */}
          <Tabs
            defaultValue="kanban"
            value={displayView}
            onValueChange={(value) =>
              setDisplayView(value as "table" | "kanban")
            }
          >
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <IconLayoutGrid size={16} />
                <span>Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <IconTable size={16} />
                <span>Tabell</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filter Tabs (All/Mine) */}
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as "all" | "mine")}
          >
            <TabsList>
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="mine">Mine</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content Area */}
      {renderContent()}

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={editTaskModalOpen}
        onOpenChange={setEditTaskModalOpen}
        workspaceId={workspaceId}
        task={selectedTask}
        onTaskUpdated={refreshTasks}
      />
    </div>
  );
}
