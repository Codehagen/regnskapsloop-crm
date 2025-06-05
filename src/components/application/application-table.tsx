"use client";

import { useEffect, useState } from "react";
import { JobApplication, JobApplicationStatus } from "@/app/generated/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { nb } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash } from "@/lib/tabler-icons";
import { updateApplicationStatus } from "@/app/actions/applications/actions";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface ApplicationTableProps {
  applications: JobApplication[];
  isLoading?: boolean;
  onStatusChange?: (id: string, status: JobApplicationStatus) => void;
}

export default function ApplicationTable({
  applications,
  isLoading = false,
  onStatusChange,
}: ApplicationTableProps) {
  const formatStatus = (status: JobApplicationStatus) => {
    switch (status) {
      case "new":
        return "Ny";
      case "reviewing":
        return "Under vurdering";
      case "interviewed":
        return "Intervjuet";
      case "offer_extended":
        return "Tilbud sendt";
      case "hired":
        return "Ansatt";
      case "rejected":
        return "Avslått";
      default:
        return status;
    }
  };

  const getStatusColor = (status: JobApplicationStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "reviewing":
        return "bg-yellow-100 text-yellow-800";
      case "interviewed":
        return "bg-purple-100 text-purple-800";
      case "offer_extended":
        return "bg-green-100 text-green-800";
      case "hired":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: JobApplicationStatus
  ) => {
    try {
      await updateApplicationStatus(id, newStatus);
      toast.success(`Søknadsstatus oppdatert til ${formatStatus(newStatus)}`);
      onStatusChange && onStatusChange(id, newStatus);
    } catch (error) {
      console.error(`Error updating application status: ${error}`);
      toast.error("Kunne ikke oppdatere søknadsstatus");
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Navn</TableHead>
            <TableHead>Stilling</TableHead>
            <TableHead>Opprettet</TableHead>
            <TableHead>Erfaring</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading state with skeleton rows
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell>
                  <Skeleton className="h-6 w-[120px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[60px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[100px]" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Ingen søknader funnet.
              </TableCell>
            </TableRow>
          ) : (
            applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">
                  {application.firstName} {application.lastName}
                </TableCell>
                <TableCell>
                  {application.desiredPosition || (
                    <span className="text-muted-foreground italic">
                      Ikke angitt
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(application.applicationDate), {
                    addSuffix: true,
                    locale: nb,
                  })}
                </TableCell>
                <TableCell>
                  {application.experience ? (
                    `${application.experience} år`
                  ) : (
                    <span className="text-muted-foreground italic">Ukjent</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${getStatusColor(
                      application.status
                    )} font-normal`}
                  >
                    {formatStatus(application.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/applications/${application.id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
