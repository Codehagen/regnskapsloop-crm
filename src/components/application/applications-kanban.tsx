"use client";

import React, { useState } from "react";
import { JobApplication, JobApplicationStatus } from "@/app/generated/prisma";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Briefcase,
  Calendar,
  BookOpen,
  DollarSign,
  Mail,
  Phone,
  Eye,
} from "@/lib/tabler-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { nb } from "date-fns/locale";
import { updateApplicationStatus } from "@/app/actions/applications/actions";
import { toast } from "sonner";
import Link from "next/link";

interface ApplicationsKanbanProps {
  applications: JobApplication[];
  onStatusChange?: (id: string, status: JobApplicationStatus) => void;
}

// Define status columns
const statusColumns: {
  id: JobApplicationStatus;
  title: string;
  description: string;
}[] = [
  {
    id: "new",
    title: "Ny",
    description: "Nye søknader som venter",
  },
  {
    id: "reviewing",
    title: "Under vurdering",
    description: "Søknader under vurdering",
  },
  {
    id: "interviewed",
    title: "Intervjuet",
    description: "Kandidater som har vært på intervju",
  },
  {
    id: "offer_extended",
    title: "Tilbud sendt",
    description: "Kandidater som har fått tilbud",
  },
  {
    id: "hired",
    title: "Ansatt",
    description: "Kandidater som har akseptert tilbud",
  },
  { id: "rejected", title: "Avslått", description: "Søknader som er avslått" },
];

export default function ApplicationsKanban({
  applications,
  onStatusChange,
}: ApplicationsKanbanProps) {
  // Group applications by status initially
  const initialColumns = statusColumns.reduce<
    Record<JobApplicationStatus, JobApplication[]>
  >(
    (acc, column) => {
      acc[column.id] = applications.filter((app) => app.status === column.id);
      return acc;
    },
    {
      new: [],
      reviewing: [],
      interviewed: [],
      offer_extended: [],
      hired: [],
      rejected: [],
    }
  );

  const [columns, setColumns] = useState(initialColumns);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the application that was dragged
    const application = applications.find((app) => app.id === draggableId);
    if (!application) return;

    const sourceStatus = source.droppableId as JobApplicationStatus;
    const destinationStatus = destination.droppableId as JobApplicationStatus;

    // Update local state optimistically
    setColumns((prev) => {
      const newColumns = { ...prev };
      // Remove from source column
      newColumns[sourceStatus] = newColumns[sourceStatus].filter(
        (app) => app.id !== draggableId
      );

      // Add to destination column with updated status
      const updatedApp = { ...application, status: destinationStatus };
      newColumns[destinationStatus] = [
        ...newColumns[destinationStatus].slice(0, destination.index),
        updatedApp,
        ...newColumns[destinationStatus].slice(destination.index),
      ];

      return newColumns;
    });

    // Update in the database
    try {
      await updateApplicationStatus(draggableId, destinationStatus);
      toast.success(
        `Søknad flyttet til ${
          statusColumns.find((s) => s.id === destinationStatus)?.title
        }`
      );
      onStatusChange && onStatusChange(draggableId, destinationStatus);
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Kunne ikke oppdatere søknadsstatus");

      // Revert local state if API call fails
      setColumns(initialColumns);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statusColumns.map((column) => (
          <div key={column.id} className="flex flex-col h-full">
            <div className="mb-2">
              <h3 className="text-sm font-medium">{column.title}</h3>
              <p className="text-xs text-muted-foreground">
                {column.description}
              </p>
            </div>

            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 min-h-[500px] rounded-lg border border-dashed p-2 bg-muted/40"
                >
                  {columns[column.id].length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        Ingen søknader
                      </p>
                    </div>
                  ) : (
                    columns[column.id].map((application, index) => (
                      <Draggable
                        key={application.id}
                        draggableId={application.id}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                          >
                            <CardHeader className="p-3 pb-0">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-sm font-medium truncate">
                                  {application.firstName} {application.lastName}
                                </CardTitle>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                      <span className="sr-only">Åpne meny</span>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <Link
                                      href={`/applications/${application.id}`}
                                    >
                                      <DropdownMenuItem>
                                        Vis detaljer
                                      </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuItem>
                                      Send e-post
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent className="p-3">
                              {application.desiredPosition && (
                                <div className="flex items-center text-xs mb-2">
                                  <Briefcase className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span className="truncate">
                                    {application.desiredPosition}
                                  </span>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                {application.experience !== null && (
                                  <div className="flex items-center">
                                    <BookOpen className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <span>{application.experience} år</span>
                                  </div>
                                )}

                                {application.expectedSalary && (
                                  <div className="flex items-center">
                                    <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <span>
                                      {application.expectedSalary / 1000}k
                                    </span>
                                  </div>
                                )}

                                {application.email && (
                                  <div className="flex items-center col-span-2 truncate">
                                    <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <span className="truncate">
                                      {application.email}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-2 pt-2 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                                <div>
                                  {formatDistanceToNow(
                                    new Date(application.applicationDate),
                                    {
                                      addSuffix: true,
                                      locale: nb,
                                    }
                                  )}
                                </div>
                                <Link
                                  href={`/applications/${application.id}`}
                                  className="text-primary hover:underline"
                                >
                                  Vis
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))
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
