"use client";

import { useCallback, useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DragStart,
} from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconUser,
  IconPhoneCall,
  IconMail,
  IconEye,
  IconMapPin,
  IconCurrencyDollar,
  IconChevronDown,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Business, CustomerStage } from "@/app/generated/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";

interface KanbanViewProps {
  leads: Business[];
  onStatusChange?: (leadId: string, newStage: CustomerStage) => void;
}

const stageColumns: {
  id: CustomerStage;
  title: string;
  description: string;
}[] = [
  {
    id: "lead",
    title: "Ny",
    description: "Nye leads som ikke er kontaktet",
  },
  {
    id: "prospect",
    title: "Kontaktet",
    description: "Leads som er i dialog",
  },
  {
    id: "qualified",
    title: "Kvalifisert",
    description: "Kvalifiserte leads klare for tilbud",
  },
  { id: "customer", title: "Kunde", description: "Konvertert til kunde" },
  { id: "churned", title: "Tapt", description: "Tapte leads" },
];

// Define displayStages outside the component so it doesn't cause re-renders
const displayStages: CustomerStage[] = [
  "lead",
  "prospect",
  "qualified",
  "customer",
  "churned",
];

const getStageLabel = (stage: CustomerStage): string => {
  return stageColumns.find((s) => s.id === stage)?.title || stage;
};

// Helper to format currency
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function KanbanView({ leads, onStatusChange }: KanbanViewProps) {
  const INITIAL_LEAD_LIMIT = 5; // Max leads to show initially
  const [columns, setColumns] = useState<Record<string, Business[]>>({});
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [expandedColumns, setExpandedColumns] = useState<
    Record<string, boolean>
  >(() =>
    displayStages.reduce<Record<string, boolean>>((acc, stage) => {
      acc[stage] = false;
      return acc;
    }, {})
  );
  // NEW STATE: Store the summed potential value for each stage
  const [stageValues, setStageValues] = useState<Record<string, number>>({});

  // Effect to update columns whenever the leads prop changes
  useEffect(() => {
    const updatedColumns = displayStages.reduce<Record<string, Business[]>>(
      (acc, stage) => {
        acc[stage] = leads.filter((lead) => lead.stage === stage);
        return acc;
      },
      {}
    );
    setColumns(updatedColumns);

    // Calculate and set the sum of potential values for relevant stages
    const newStageValues = displayStages.reduce<Record<string, number>>(
      (acc, stage) => {
        if (["lead", "prospect", "qualified"].includes(stage)) {
          acc[stage] =
            updatedColumns[stage]?.reduce(
              (sum, lead) => sum + (lead.potensiellVerdi || 0),
              0
            ) || 0;
        }
        return acc;
      },
      {}
    );
    setStageValues(newStageValues);
  }, [leads]); // Removed displayStages from dependencies

  // Function to toggle column expansion
  const toggleColumnExpansion = (stageId: CustomerStage) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

  const handleDragStart = (start: DragStart) => {
    setDraggingItemId(start.draggableId);
  };

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      setDraggingItemId(null);
      const { destination, source, draggableId } = result;

      if (!destination) return;

      const sourceStage = source.droppableId as CustomerStage;
      const destinationStage = destination.droppableId as CustomerStage;

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const lead = leads.find((l) => l.id === draggableId);
      if (!lead) return;

      setColumns((prev) => {
        const newColumns = { ...prev };

        const sourceItems = Array.isArray(newColumns[sourceStage])
          ? [...newColumns[sourceStage]]
          : [];
        const [removed] = sourceItems.splice(source.index, 1);
        newColumns[sourceStage] = sourceItems;

        const destinationItems = Array.isArray(newColumns[destinationStage])
          ? [...newColumns[destinationStage]]
          : [];

        if (removed) {
          destinationItems.splice(destination.index, 0, removed);
          newColumns[destinationStage] = destinationItems;
        } else {
          destinationItems.splice(destination.index, 0, lead);
          newColumns[destinationStage] = destinationItems;
          console.warn(
            "Dragged item not found in source column state during optimistic update."
          );
        }

        return newColumns;
      });

      if (onStatusChange && sourceStage !== destinationStage) {
        onStatusChange(draggableId, destinationStage);
      }
    },
    [leads, onStatusChange]
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {displayStages.map((stageId) => {
          const columnInfo = stageColumns.find((s) => s.id === stageId);
          if (!columnInfo) return null;
          const currentLeads = columns[stageId] || [];
          const currentStageValue = stageValues[stageId] || 0;

          return (
            <div key={stageId} className="flex flex-col h-full">
              <div className="mb-2 px-1">
                <h3 className="text-sm font-medium">
                  {columnInfo.title}{" "}
                  <Badge
                    variant="secondary"
                    className="ml-1 font-normal text-xs"
                  >
                    {currentLeads.length}
                  </Badge>
                  {/* Display potential value sum for specific stages */}
                  {["lead", "prospect", "qualified"].includes(stageId) &&
                    currentStageValue > 0 && (
                      <Badge
                        variant="outline"
                        className="ml-1 font-normal text-xs text-muted-foreground"
                      >
                        {formatCurrency(currentStageValue)}
                      </Badge>
                    )}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {columnInfo.description}
                </p>
              </div>

              <Droppable droppableId={stageId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-1 min-h-[500px] rounded-lg border border-dashed p-2 transition-colors",
                      snapshot.isDraggingOver ? "bg-accent" : "bg-muted/40"
                    )}
                  >
                    {currentLeads.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                          Ingen leads
                        </p>
                      </div>
                    ) : (
                      currentLeads.map((lead, index) => (
                        <Draggable
                          key={lead.id}
                          draggableId={lead.id}
                          index={index}
                        >
                          {(providedDraggable, snapshotDraggable) => (
                            <Card
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                              className={cn(
                                "mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
                                snapshotDraggable.isDragging &&
                                  "ring-2 ring-primary shadow-lg",
                                draggingItemId === lead.id && "opacity-90"
                              )}
                              style={{
                                ...providedDraggable.draggableProps.style,
                              }}
                            >
                              <CardHeader className="p-2 pb-0">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-sm font-medium truncate">
                                    <Link
                                      href={`/leads/${lead.id}`}
                                      className="hover:underline hover:text-primary"
                                      title={lead.name}
                                    >
                                      {lead.name}
                                    </Link>
                                  </CardTitle>
                                  <Link href={`/leads/${lead.id}`}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                      aria-label="Vis detaljer"
                                      title="Vis detaljer"
                                    >
                                      <IconEye size={16} />
                                    </Button>
                                  </Link>
                                </div>
                              </CardHeader>
                              <CardContent className="p-2 pt-1">
                                <div className="space-y-0.5 text-xs text-muted-foreground">
                                  {lead.contactPerson &&
                                    lead.contactPerson !== lead.name && (
                                      <div className="flex items-center">
                                        <IconUser
                                          size={12}
                                          className="mr-1.5 shrink-0"
                                        />
                                        <span
                                          className="truncate"
                                          title={lead.contactPerson}
                                        >
                                          {lead.contactPerson}
                                        </span>
                                      </div>
                                    )}
                                  {lead.phone && (
                                    <div className="flex items-center">
                                      <IconPhoneCall
                                        size={12}
                                        className="mr-1.5 shrink-0"
                                      />
                                      <a
                                        href={`tel:${lead.phone}`}
                                        className="hover:underline"
                                        title={lead.phone}
                                      >
                                        {lead.phone}
                                      </a>
                                    </div>
                                  )}
                                  {lead.email && (
                                    <div className="flex items-center">
                                      <IconMail
                                        size={12}
                                        className="mr-1.5 shrink-0"
                                      />
                                      <a
                                        href={`mailto:${lead.email}`}
                                        className="hover:underline truncate"
                                        title={lead.email}
                                      >
                                        {lead.email}
                                      </a>
                                    </div>
                                  )}
                                  {/* Always show potential value, with empty state */}
                                  <div className="flex items-center">
                                    <IconCurrencyDollar
                                      size={12}
                                      className="mr-1.5 shrink-0"
                                    />
                                    <span
                                      className="truncate"
                                      title={`Potensiell verdi: ${
                                        lead.potensiellVerdi
                                          ? formatCurrency(lead.potensiellVerdi)
                                          : "Ingen verdi"
                                      }`}
                                    >
                                      {lead.potensiellVerdi ? (
                                        formatCurrency(lead.potensiellVerdi)
                                      ) : (
                                        <span className="text-gray-400">
                                          Ingen verdi
                                        </span>
                                      )}
                                    </span>
                                  </div>
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
          );
        })}
      </div>
    </DragDropContext>
  );
}
