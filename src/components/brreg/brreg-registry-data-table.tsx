"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrregBusiness } from "@/app/generated/prisma";
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
  A: "bg-green-100 text-green-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-purple-100 text-purple-800",
  D: "bg-yellow-100 text-yellow-800",
  E: "bg-gray-100 text-gray-800",
  F: "bg-orange-100 text-orange-800",
  G: "bg-red-100 text-red-800",
  H: "bg-indigo-100 text-indigo-800",
  I: "bg-pink-100 text-pink-800",
  J: "bg-cyan-100 text-cyan-800",
  K: "bg-emerald-100 text-emerald-800",
  L: "bg-violet-100 text-violet-800",
  M: "bg-lime-100 text-lime-800",
  N: "bg-amber-100 text-amber-800",
  O: "bg-teal-100 text-teal-800",
  P: "bg-sky-100 text-sky-800",
  Q: "bg-rose-100 text-rose-800",
  R: "bg-slate-100 text-slate-800",
  S: "bg-stone-100 text-stone-800",
  T: "bg-zinc-100 text-zinc-800",
  U: "bg-neutral-100 text-neutral-800",
};

interface BrregRegistryDataTableProps {
  businesses: BrregBusiness[];
}

export function BrregRegistryDataTable({
  businesses,
}: BrregRegistryDataTableProps) {
  const handleAddAsLead = async (business: BrregBusiness) => {
    try {
      // For now, use a placeholder workspace ID
      const workspaceId = "placeholder-workspace-id";

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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Organization Form</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Employees</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No companies found.
              </TableCell>
            </TableRow>
          ) : (
            businesses.map((business) => (
              <TableRow key={business.id}>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <div className="font-medium">{business.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {business.orgNumber}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {business.orgFormDesc ? (
                    <Badge variant="outline">
                      {business.orgFormCode} - {business.orgFormDesc}
                    </Badge>
                  ) : null}
                </TableCell>

                <TableCell>
                  {business.industrySectionName && business.industrySection ? (
                    <Badge
                      className={
                        industryColors[business.industrySection] ||
                        "bg-gray-100 text-gray-800"
                      }
                    >
                      {business.industrySection}: {business.industrySectionName}
                    </Badge>
                  ) : null}
                </TableCell>

                <TableCell>
                  {business.businessMunicipality ? (
                    <div className="text-sm">
                      <div className="font-medium">
                        {business.businessMunicipality}
                      </div>
                      {business.businessCity &&
                        business.businessCity !==
                          business.businessMunicipality && (
                          <div className="text-muted-foreground">
                            {business.businessCity}
                          </div>
                        )}
                    </div>
                  ) : null}
                </TableCell>

                <TableCell>
                  {!business.hasRegisteredEmployees ? (
                    <span className="text-muted-foreground text-sm">
                      Not registered
                    </span>
                  ) : business.numberOfEmployees ? (
                    <Badge variant="secondary">
                      {business.numberOfEmployees}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      Unknown
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  {(business.email || business.phone || business.website) && (
                    <div className="flex items-center gap-2">
                      {business.email && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      )}
                      {business.phone && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      )}
                      {business.website && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Globe className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {business.vatRegistered && (
                      <Badge variant="default" className="text-xs">
                        VAT
                      </Badge>
                    )}
                    {business.isBankrupt && (
                      <Badge variant="destructive" className="text-xs">
                        Bankrupt
                      </Badge>
                    )}
                    {business.isWindingUp && (
                      <Badge variant="destructive" className="text-xs">
                        Winding Up
                      </Badge>
                    )}
                    {!business.vatRegistered &&
                      !business.isBankrupt &&
                      !business.isWindingUp && (
                        <span className="text-muted-foreground text-xs">
                          Active
                        </span>
                      )}
                  </div>
                </TableCell>

                <TableCell>
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
                        onClick={() =>
                          navigator.clipboard.writeText(business.orgNumber)
                        }
                      >
                        Copy org number
                      </DropdownMenuItem>
                      {business.website && (
                        <DropdownMenuItem
                          onClick={() =>
                            window.open(business.website!, "_blank")
                          }
                        >
                          Visit website
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleAddAsLead(business)}
                      >
                        Add as Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
