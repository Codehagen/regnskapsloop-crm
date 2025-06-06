"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Business,
  Task,
  TaskStatus,
  TaskPriority,
} from "@/app/generated/prisma";
import {
  getTasksForBusiness,
  updateTaskStatus,
} from "@/app/actions/tasks/actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";
import {
  IconClockHour4,
  IconUser,
  IconCalendar,
  IconFlag,
  IconCircle,
  IconCircleDot,
  IconCircleCheck,
  IconPlus,
} from "@tabler/icons-react";
import { AddTaskButtonWrapper } from "@/components/task/add-task-button-wrapper";

// Extended Task type that includes assignees and business
type TaskWithRelations = Task & {
  assignees: { id: string; name: string | null; email: string }[];
  business?: { id: string; name: string } | null;
};

interface LeadTasksProps {
  lead: Business;
  workspaceId: string;
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

// Helper function to get priority labels and colors
const getPriorityProps = (priority: TaskPriority) => {
  switch (priority) {
    case "high":
      return {
        label: "Høy",
        color: "text-red-600",
        bg: "bg-red-50 border-red-200",
      };
    case "medium":
      return {
        label: "Medium",
        color: "text-yellow-600",
        bg: "bg-yellow-50 border-yellow-200",
      };
    case "low":
      return {
        label: "Lav",
        color: "text-green-600",
        bg: "bg-green-50 border-green-200",
      };
    default:
      return {
        label: "Medium",
        color: "text-yellow-600",
        bg: "bg-yellow-50 border-yellow-200",
      };
  }
};

// Helper function to get status icon and colors
const getStatusProps = (status: TaskStatus) => {
  switch (status) {
    case "ikke_startet":
      return {
        icon: IconCircle,
        color: "text-gray-500",
        bg: "bg-gray-50",
        variant: "secondary" as const,
      };
    case "pabegynt":
      return {
        icon: IconCircleDot,
        color: "text-blue-600",
        bg: "bg-blue-50",
        variant: "default" as const,
      };
    case "ferdig":
      return {
        icon: IconCircleCheck,
        color: "text-green-600",
        bg: "bg-green-50",
        variant: "outline" as const,
      };
    default:
      return {
        icon: IconCircle,
        color: "text-gray-500",
        bg: "bg-gray-50",
        variant: "secondary" as const,
      };
  }
};

export function LeadTasks({ lead, workspaceId }: LeadTasksProps) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks for this specific business
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await getTasksForBusiness(workspaceId, lead.id);
        setTasks(data as TaskWithRelations[]);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Kunne ikke laste oppgaver");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [workspaceId, lead.id]);

  // Handle status change
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (!taskToUpdate) return;

    const oldStatus = taskToUpdate.status;
    const originalTasks = [...tasks];

    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      // Call server action
      await updateTaskStatus(taskId, newStatus, workspaceId);

      // Success toast
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
              {getStatusLabel(newStatus)}
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Oppgaver</h3>
          <div className="h-9 w-32 bg-muted rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              <div className="h-6 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Oppgaver {tasks.length > 0 && `(${tasks.length})`}
        </h3>
        <AddTaskButtonWrapper workspaceId={workspaceId} businessId={lead.id} />
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <IconClockHour4 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Ingen oppgaver ennå</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Opprett en oppgave for å holde styr på ting som må gjøres for{" "}
              {lead.name}.
            </p>
            <AddTaskButtonWrapper
              workspaceId={workspaceId}
              businessId={lead.id}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const statusProps = getStatusProps(task.status);
            const priorityProps = getPriorityProps(task.priority);
            const StatusIcon = statusProps.icon;

            return (
              <Card key={task.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon
                          className={`h-4 w-4 ${statusProps.color}`}
                        />
                        <h4 className="font-medium truncate">{task.title}</h4>
                      </div>

                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant={statusProps.variant}>
                          {getStatusLabel(task.status)}
                        </Badge>

                        <Badge
                          variant="outline"
                          className={`${priorityProps.bg} ${priorityProps.color} border`}
                        >
                          <IconFlag className="h-3 w-3 mr-1" />
                          {priorityProps.label}
                        </Badge>

                        {task.assignees.length > 0 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <IconUser className="h-3 w-3" />
                            <span>
                              {task.assignees
                                .map((a) => a.name || a.email)
                                .join(", ")}
                            </span>
                          </div>
                        )}

                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <IconCalendar className="h-3 w-3" />
                            <span>
                              Frist:{" "}
                              {formatDistanceToNow(new Date(task.dueDate), {
                                addSuffix: true,
                                locale: nb,
                              })}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-muted-foreground">
                          <IconClockHour4 className="h-3 w-3" />
                          <span>
                            Opprettet{" "}
                            {formatDistanceToNow(new Date(task.createdAt), {
                              addSuffix: true,
                              locale: nb,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex-shrink-0">
                      <Select
                        value={task.status}
                        onValueChange={(value) =>
                          handleStatusChange(task.id, value as TaskStatus)
                        }
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ikke_startet">
                            Ikke startet
                          </SelectItem>
                          <SelectItem value="pabegynt">Påbegynt</SelectItem>
                          <SelectItem value="ferdig">Ferdig</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
