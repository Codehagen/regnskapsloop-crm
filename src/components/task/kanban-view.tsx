"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Task, TaskStatus, TaskPriority } from "@/app/generated/prisma";
import {
  IconUser,
  IconCalendarDue,
  IconBuilding,
  IconFlag,
  IconClock,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";

interface KanbanViewProps {
  tasks: Task[];
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
}

const statusColumns = [
  {
    id: "ikke_startet",
    title: "Ikke startet",
    description: "Oppgaver som ikke er startet",
  },
  { id: "pabegynt", title: "Påbegynt", description: "Oppgaver under arbeid" },
  { id: "ferdig", title: "Ferdig", description: "Fullførte oppgaver" },
];

// Helper function to get priority color
const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case "high":
      return "text-red-600";
    case "medium":
      return "text-yellow-600";
    case "low":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

// Helper function to get priority label
const getPriorityLabel = (priority: TaskPriority): string => {
  switch (priority) {
    case "high":
      return "Høy";
    case "medium":
      return "Middels";
    case "low":
      return "Lav";
    default:
      return "Ukjent";
  }
};

export function TaskKanbanView({
  tasks,
  onStatusChange,
  onTaskClick,
}: KanbanViewProps) {
  const [columns, setColumns] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    const updated = statusColumns.reduce((acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    }, {} as Record<string, Task[]>);
    setColumns(updated);
  }, [tasks]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;
    if (sourceStatus === destStatus && source.index === destination.index)
      return;

    setColumns((prev) => {
      const copy = { ...prev };
      const sourceItems = Array.from(copy[sourceStatus] || []);
      const [removed] = sourceItems.splice(source.index, 1);
      copy[sourceStatus] = sourceItems;
      const destItems = Array.from(copy[destStatus] || []);
      if (removed) destItems.splice(destination.index, 0, removed);
      copy[destStatus] = destItems;
      return copy;
    });

    if (onStatusChange && sourceStatus !== destStatus) {
      onStatusChange(draggableId, destStatus);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusColumns.map((col) => (
          <div key={col.id} className="flex flex-col h-full">
            <div className="mb-2 px-1">
              <h3 className="text-sm font-medium">
                {col.title}
                <Badge variant="secondary" className="ml-1 font-normal text-xs">
                  {(columns[col.id] || []).length}
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">{col.description}</p>
            </div>
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex-1 min-h-[300px] rounded-lg border border-dashed p-2 transition-colors",
                    snapshot.isDraggingOver ? "bg-accent" : "bg-muted/40"
                  )}
                >
                  {(columns[col.id] || []).length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        Ingen oppgaver
                      </p>
                    </div>
                  ) : (
                    (columns[col.id] || []).map((task, index) => {
                      const isOverdue =
                        task.dueDate && new Date() > task.dueDate;

                      return (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(prov, snap) => (
                            <Card
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={cn(
                                "mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
                                snap.isDragging &&
                                  "ring-2 ring-primary shadow-lg",
                                isOverdue && "border-red-200 bg-red-50/50"
                              )}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onTaskClick?.(task);
                              }}
                            >
                              <CardHeader className="p-2 pb-0">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-sm font-medium truncate flex-1 pr-2">
                                    {task.title}
                                  </CardTitle>
                                  <div className="flex items-center gap-1">
                                    {/* Priority Indicator */}
                                    <IconFlag
                                      size={14}
                                      className={cn(
                                        "shrink-0",
                                        getPriorityColor(task.priority)
                                      )}
                                      title={`Prioritet: ${getPriorityLabel(
                                        task.priority
                                      )}`}
                                    />
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-2 pt-1">
                                {/* Description */}
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                <div className="space-y-1 text-xs text-muted-foreground">
                                  {/* Business Association */}
                                  {(task as any).business && (
                                    <div className="flex items-center">
                                      <IconBuilding
                                        size={12}
                                        className="mr-1.5 shrink-0"
                                      />
                                      <span
                                        className="truncate"
                                        title={(task as any).business.name}
                                      >
                                        {(task as any).business.name}
                                      </span>
                                    </div>
                                  )}

                                  {/* Assignees */}
                                  {(task as any).assignees &&
                                    (task as any).assignees.length > 0 && (
                                      <div className="flex items-center">
                                        <IconUser
                                          size={12}
                                          className="mr-1.5 shrink-0"
                                        />
                                        <div className="flex items-center gap-1 min-w-0 flex-1">
                                          <div className="flex -space-x-1">
                                            {(task as any).assignees
                                              .slice(0, 2)
                                              .map((assignee: any) => (
                                                <Avatar
                                                  key={assignee.id}
                                                  className="h-4 w-4 border border-background"
                                                >
                                                  <AvatarImage
                                                    src={undefined}
                                                  />
                                                  <AvatarFallback className="text-[10px]">
                                                    {assignee.name
                                                      ?.slice(0, 2)
                                                      .toUpperCase() ||
                                                      assignee.email
                                                        ?.slice(0, 2)
                                                        .toUpperCase()}
                                                  </AvatarFallback>
                                                </Avatar>
                                              ))}
                                          </div>
                                          <span className="text-xs truncate">
                                            {(task as any).assignees.length ===
                                            1
                                              ? (task as any).assignees[0]
                                                  .name ||
                                                (task as any).assignees[0].email
                                              : `${
                                                  (task as any).assignees.length
                                                } personer`}
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                  {/* Due Date */}
                                  {task.dueDate && (
                                    <div className="flex items-center">
                                      <IconCalendarDue
                                        size={12}
                                        className={cn(
                                          "mr-1.5 shrink-0",
                                          isOverdue ? "text-red-600" : ""
                                        )}
                                      />
                                      <span
                                        className={cn(
                                          "truncate",
                                          isOverdue
                                            ? "text-red-600 font-medium"
                                            : ""
                                        )}
                                        title={`Forfaller: ${task.dueDate.toLocaleDateString(
                                          "nb-NO"
                                        )}`}
                                      >
                                        {formatDistanceToNow(task.dueDate, {
                                          addSuffix: true,
                                          locale: nb,
                                        })}
                                      </span>
                                    </div>
                                  )}

                                  {/* Created Date */}
                                  <div className="flex items-center">
                                    <IconClock
                                      size={12}
                                      className="mr-1.5 shrink-0"
                                    />
                                    <span className="truncate">
                                      Opprettet{" "}
                                      {formatDistanceToNow(task.createdAt, {
                                        addSuffix: true,
                                        locale: nb,
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      );
                    })
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
