"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Business } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";

export const brregColumns: ColumnDef<Business>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Navn<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
    ),
  },
  { accessorKey: "orgNumber", header: "Org.nr" },
  { accessorKey: "industry", header: "Bransje" },
  { accessorKey: "city", header: "Poststed" },
];
