"use client";

import { useState } from "react";
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
import { Building2, Loader2 } from "lucide-react";
import { convertBrregApiToLead } from "@/app/actions/brreg/actions";
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
  workspaceId: string;
}

export function BrregRegistryDataTable({
  businesses,
  workspaceId,
}: BrregRegistryDataTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAddAsLead = async (business: BrregBusiness) => {
    setLoadingId(business.id);
    try {
      const result = await convertBrregApiToLead(
        business.orgNumber,
        workspaceId
      );

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Klarte ikke å legge til lead");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bedrift</TableHead>
            <TableHead>Organisasjonsform</TableHead>
            <TableHead>NACE-kode</TableHead>
            <TableHead>Stiftelsesdato</TableHead>
            <TableHead>MVA-registrert</TableHead>
            <TableHead className="w-[120px]">Handling</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Ingen bedrifter funnet.
              </TableCell>
            </TableRow>
          ) : (
            businesses.map((business) => (
              <TableRow key={business.id || business.orgNumber}>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <a
                      href={`https://www.proff.no/bransjesøk?q=${business.orgNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-primary hover:underline underline-offset-4 transition-colors cursor-pointer"
                    >
                      {business.name}
                    </a>
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
                  {business.naceCode1 ? (
                    <div className="text-sm">
                      <div className="font-medium">{business.naceCode1}</div>
                      {business.naceDesc1 && (
                        <div className="text-muted-foreground text-xs max-w-xs truncate">
                          {business.naceDesc1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>

                <TableCell>
                  {business.establishedDate ? (
                    <div className="text-sm">
                      {new Date(business.establishedDate).toLocaleDateString(
                        "no-NO"
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>

                <TableCell>
                  {business.vatRegistered !== null ? (
                    <Badge
                      variant={business.vatRegistered ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {business.vatRegistered ? "Ja" : "Nei"}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>

                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddAsLead(business)}
                    disabled={loadingId === business.id}
                    className="w-full"
                  >
                    {loadingId === business.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Legger til...
                      </>
                    ) : (
                      "Legg til lead"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
