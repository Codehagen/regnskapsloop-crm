"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BrregBusiness } from "@/app/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Building2, Mail, Phone, Globe } from "lucide-react";
import { convertBrregToLead } from "@/app/actions/brreg/actions";
import { toast } from "sonner";

const industryColors: Record<string, string> = {
  A: "bg-green-100 text-green-800 hover:bg-green-200",
  B: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  C: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  D: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  E: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  F: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  G: "bg-red-100 text-red-800 hover:bg-red-200",
  H: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  I: "bg-pink-100 text-pink-800 hover:bg-pink-200",
  J: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
  K: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  L: "bg-violet-100 text-violet-800 hover:bg-violet-200",
  M: "bg-lime-100 text-lime-800 hover:bg-lime-200",
  N: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  O: "bg-teal-100 text-teal-800 hover:bg-teal-200",
  P: "bg-sky-100 text-sky-800 hover:bg-sky-200",
  Q: "bg-rose-100 text-rose-800 hover:bg-rose-200",
  R: "bg-slate-100 text-slate-800 hover:bg-slate-200",
  S: "bg-stone-100 text-stone-800 hover:bg-stone-200",
  T: "bg-zinc-100 text-zinc-800 hover:bg-zinc-200",
  U: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
};

export const brregRegistryColumns: ColumnDef<BrregBusiness>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company Name" />
    ),
    cell: ({ row }) => {
      const business = row.original;
      return (
        <div className="flex flex-col space-y-1">
          <div className="font-medium">{business.name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {business.orgNumber}
          </div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "orgFormDesc",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organization Form" />
    ),
    cell: ({ row }) => {
      const orgForm = row.getValue("orgFormDesc") as string;
      const orgCode = row.original.orgFormCode;
      return orgForm ? (
        <Badge variant="outline">
          {orgCode} - {orgForm}
        </Badge>
      ) : null;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "industrySectionName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Industry" />
    ),
    cell: ({ row }) => {
      const industry = row.getValue("industrySectionName") as string;
      const section = row.original.industrySection;
      if (!industry || !section) return null;

      const colorClass = industryColors[section] || "bg-gray-100 text-gray-800";
      return (
        <Badge className={colorClass}>
          {section}: {industry}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "naceDesc1",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NACE Description" />
    ),
    cell: ({ row }) => {
      const naceDesc = row.getValue("naceDesc1") as string;
      const naceCode = row.original.naceCode1;
      return naceDesc ? (
        <div className="text-sm">
          <div className="font-medium">{naceCode}</div>
          <div className="text-muted-foreground">{naceDesc}</div>
        </div>
      ) : null;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "businessMunicipality",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const municipality = row.getValue("businessMunicipality") as string;
      const city = row.original.businessCity;
      return municipality ? (
        <div className="text-sm">
          <div className="font-medium">{municipality}</div>
          {city && city !== municipality && (
            <div className="text-muted-foreground">{city}</div>
          )}
        </div>
      ) : null;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "numberOfEmployees",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employees" />
    ),
    cell: ({ row }) => {
      const employees = row.getValue("numberOfEmployees") as number;
      const hasRegistered = row.original.hasRegisteredEmployees;

      if (!hasRegistered) {
        return <span className="text-muted-foreground">Not registered</span>;
      }

      return employees ? (
        <Badge variant="secondary">{employees}</Badge>
      ) : (
        <span className="text-muted-foreground">Unknown</span>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const business = row.original;
      const hasContact = business.email || business.phone || business.website;

      if (!hasContact) return null;

      return (
        <div className="flex items-center gap-2">
          {business.email && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Mail className="h-3 w-3" />
            </Button>
          )}
          {business.phone && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Phone className="h-3 w-3" />
            </Button>
          )}
          {business.website && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Globe className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const business = row.original;
      const statuses = [];

      if (business.vatRegistered) statuses.push("VAT");
      if (business.isBankrupt) statuses.push("Bankrupt");
      if (business.isWindingUp) statuses.push("Winding Up");

      return (
        <div className="flex flex-wrap gap-1">
          {statuses.map((status) => (
            <Badge
              key={status}
              variant={
                status === "Bankrupt" || status === "Winding Up"
                  ? "destructive"
                  : "default"
              }
              className="text-xs"
            >
              {status}
            </Badge>
          ))}
          {statuses.length === 0 && (
            <span className="text-muted-foreground text-xs">Active</span>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const business = row.original;

      const handleAddAsLead = async () => {
        try {
          // For now, we'll use a hardcoded workspace ID
          // In a real app, you'd get this from context or props
          const workspaceId = "your-workspace-id"; // Replace with actual workspace ID

          const result = await convertBrregToLead(business.id, workspaceId);

          if (result.success) {
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        } catch (error) {
          toast.error("Failed to add as lead");
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(business.orgNumber)}
            >
              Copy org number
            </DropdownMenuItem>
            {business.website && (
              <DropdownMenuItem
                onClick={() => window.open(business.website!, "_blank")}
              >
                Visit website
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAddAsLead}>
              Add as Lead
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
