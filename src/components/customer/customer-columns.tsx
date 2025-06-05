"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { Business, CustomerStage } from "@/app/generated/prisma";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Function to get status badge with appropriate color
function getStatusBadge(stage: CustomerStage) {
  const statusMap: Record<
    CustomerStage,
    {
      label: string;
      variant: "default" | "outline" | "secondary" | "destructive" | "success";
    }
  > = {
    lead: { label: "Ny", variant: "secondary" },
    prospect: { label: "Kontaktet", variant: "default" },
    qualified: { label: "Kvalifisert", variant: "default" },
    customer: { label: "Kunde", variant: "success" },
    churned: { label: "Tapt", variant: "destructive" },
  };

  const { label, variant } = statusMap[stage];
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

// Column definitions for customers
export const customerColumns: ColumnDef<Business>[] = [
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
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <Link
          href={`/customers/${customer.id}`}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
        >
          {customer.name}
          <ExternalLink className="h-3 w-3" />
        </Link>
      );
    },
  },
  {
    accessorKey: "email",
    header: "E-post",
    cell: ({ row }) => <div>{row.getValue("email") || "-"}</div>,
  },
  {
    accessorKey: "phone",
    header: "Telefon",
    cell: ({ row }) => <div>{row.getValue("phone") || "-"}</div>,
  },
  {
    accessorKey: "contactPerson",
    header: "Kontaktperson",
    cell: ({ row }) => <div>{row.getValue("contactPerson") || "-"}</div>,
  },
  {
    accessorKey: "stage",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("stage")),
  },
  {
    accessorKey: "orgNumber",
    header: "Org.nr",
    cell: ({ row }) => <div>{row.getValue("orgNumber") || "-"}</div>,
  },
  {
    accessorKey: "industry",
    header: "Bransje",
    cell: ({ row }) => <div>{row.getValue("industry") || "-"}</div>,
  },
  {
    accessorKey: "potensiellVerdi",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="justify-end w-full"
      >
        Potensiell Verdi
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = row.getValue("potensiellVerdi");
      if (!amount) return <div className="text-right">-</div>;

      const formatted = new Intl.NumberFormat("no-NO", {
        style: "currency",
        currency: "NOK",
      }).format(amount as number);

      return <div className="text-right font-medium">{formatted}</div>;
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
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{date.toLocaleDateString("nb-NO")}</div>;
    },
  },
];
