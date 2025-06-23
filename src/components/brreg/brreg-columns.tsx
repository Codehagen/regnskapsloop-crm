"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Business } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const brregColumns: ColumnDef<Business>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Navn
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "orgNumber",
    header: "Org.nr",
    cell: ({ row }) => {
      const orgNumber = row.getValue("orgNumber") as string;
      return <code className="text-sm">{orgNumber}</code>;
    },
  },
  {
    accessorKey: "orgForm",
    header: "Selskapsform",
    cell: ({ row }) => {
      const orgForm = row.getValue("orgForm") as string;
      return orgForm ? <Badge variant="secondary">{orgForm}</Badge> : null;
    },
  },
  { accessorKey: "industry", header: "Bransje" },
  { accessorKey: "city", header: "Poststed" },
  {
    accessorKey: "email",
    header: "E-post",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      if (email === "placeholder@example.com")
        return <span className="text-muted-foreground">-</span>;
      return email;
    },
  },
  {
    accessorKey: "phone",
    header: "Telefon",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return phone || <span className="text-muted-foreground">-</span>;
    },
  },
];
