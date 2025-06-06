"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Task, TaskStatus } from "@/app/generated/prisma";

interface KanbanViewProps {
  tasks: Task[];
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const statusColumns = [
  { id: "ikke_startet", title: "Ikke startet" },
  { id: "pabegynt", title: "Påbegynt" },
  { id: "ferdig", title: "Ferdig" },
];

export function TaskKanbanView({ tasks, onStatusChange }: KanbanViewProps) {
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
    if (sourceStatus === destStatus && source.index === destination.index) return;

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
                  {(columns[col.id] || []).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(prov, snap) => (
                        <Card
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={cn(
                            "mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
                            snap.isDragging && "ring-2 ring-primary shadow-lg"
                          )}
                        >
                          <CardHeader className="p-2 pb-0">
                            <CardTitle className="text-sm font-medium truncate">
                              {task.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-2 pt-1 text-xs text-muted-foreground">
                            {task.description}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
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
