"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IconArrowsSort } from "@tabler/icons-react";
import { Task, TaskStatus, TaskPriority } from "@/app/generated/prisma";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";

// Function to get status badge with appropriate color
function getStatusBadge(status: TaskStatus) {
  const statusMap: Record<
    TaskStatus,
    {
      label: string;
      variant: "default" | "outline" | "secondary" | "destructive" | "success";
    }
  > = {
    ikke_startet: { label: "Ikke startet", variant: "secondary" },
    pabegynt: { label: "Påbegynt", variant: "default" },
    ferdig: { label: "Ferdig", variant: "success" },
  };

  const { label, variant } = statusMap[status];
  return (
    <Badge
      variant={
        variant as "default" | "destructive" | "outline" | "secondary" | null
      }
    >
      {label}
    </Badge>
  );
}

// Function to get priority badge with appropriate color
function getPriorityBadge(priority: TaskPriority) {
  const priorityMap: Record<
    TaskPriority,
    {
      label: string;
      variant: "default" | "outline" | "secondary" | "destructive" | "success";
    }
  > = {
    low: { label: "Lav", variant: "outline" },
    medium: { label: "Middels", variant: "secondary" },
    high: { label: "Høy", variant: "destructive" },
  };

  const { label, variant } = priorityMap[priority];
  return (
    <Badge
      variant={
        variant as "default" | "destructive" | "outline" | "secondary" | null
      }
    >
      {label}
    </Badge>
  );
}

// Column definitions
export const taskColumns: ColumnDef<any>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tittel
        <IconArrowsSort size={16} className="ml-2" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Beskrivelse",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return <div className="max-w-[200px] truncate">{description || "-"}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "priority",
    header: "Prioritet",
    cell: ({ row }) => getPriorityBadge(row.getValue("priority")),
  },
  {
    accessorKey: "business",
    header: "Bedrift",
    cell: ({ row }) => {
      const business = row.getValue("business") as any;
      return <div>{business?.name || "-"}</div>;
    },
  },
  {
    accessorKey: "assignees",
    header: "Tildelt",
    cell: ({ row }) => {
      const assignees = row.getValue("assignees") as any[];
      if (!assignees || assignees.length === 0) {
        return <div className="text-muted-foreground">-</div>;
      }

      if (assignees.length === 1) {
        const assignee = assignees[0];
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={undefined} />
              <AvatarFallback className="text-xs">
                {assignee.name?.slice(0, 2).toUpperCase() ||
                  assignee.email?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{assignee.name || assignee.email}</span>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            {assignees.slice(0, 2).map((assignee, index) => (
              <Avatar key={assignee.id} className="h-6 w-6">
                <AvatarImage src={undefined} />
                <AvatarFallback className="text-xs">
                  {assignee.name?.slice(0, 2).toUpperCase() ||
                    assignee.email?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {assignees.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{assignees.length - 2}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Forfallsdato
        <IconArrowsSort size={16} className="ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate") as Date | null;
      if (!dueDate) return <div>-</div>;

      const isOverdue = new Date() > dueDate;
      return (
        <div className={isOverdue ? "text-destructive font-medium" : ""}>
          {formatDistanceToNow(dueDate, { addSuffix: true, locale: nb })}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Opprettet
        <IconArrowsSort size={16} className="ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date;
      return (
        <div>
          {formatDistanceToNow(createdAt, { addSuffix: true, locale: nb })}
        </div>
      );
    },
  },
];
