"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { LayoutGrid, Table as TableIcon, Search, Plus } from "@/lib/tabler-icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobApplication, JobApplicationStatus } from "@/app/generated/prisma";
import {
  getApplications,
  updateApplicationStatus,
  searchApplications,
} from "../actions/applications/actions";
import ApplicationTable from "@/components/application/application-table";
import ApplicationsKanban from "@/components/application/applications-kanban";

export default function ApplicationsPage() {
  // Track which view is active
  const [view, setView] = useState<"table" | "kanban">("kanban");

  // State to manage applications data
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch applications on component mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await getApplications();
        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Function to update an application's status
  const handleStatusChange = async (
    applicationId: string,
    newStatus: JobApplicationStatus
  ) => {
    // Find the application being updated
    const applicationToUpdate = applications.find(
      (app) => app.id === applicationId
    );
    if (!applicationToUpdate) return;

    // Store the original status before updating
    const oldStatus = applicationToUpdate.status;

    // Store the original applications state in case we need to revert
    const originalApplications = [...applications];

    try {
      // Optimistically update the UI
      const updatedApplications = applications.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApplications);

      // Make the API call
      await updateApplicationStatus(applicationId, newStatus);

      // Show a detailed toast notification after successful update
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-medium">Søknad status oppdatert</div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">
              {applicationToUpdate.firstName} {applicationToUpdate.lastName}
            </span>{" "}
            ble flyttet fra{" "}
            <Badge variant="outline" className="ml-1 mr-1">
              {getStatusLabel(oldStatus)}
            </Badge>
            <span>→</span>
            <Badge variant="outline" className="ml-1">
              {getStatusLabel(newStatus)}
            </Badge>
          </div>
        </div>
      );
    } catch (error) {
      // Revert to original state on error
      setApplications(originalApplications);
      console.error("Error updating application status:", error);
      toast.error("Failed to update application status");
    }
  };

  // Function to handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // If search is cleared, fetch all applications
      try {
        setLoading(true);
        const data = await getApplications();
        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const results = await searchApplications(searchTerm);
      setApplications(results);
    } catch (error) {
      console.error("Error searching applications:", error);
      toast.error("Failed to search applications");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get readable status labels
  const getStatusLabel = (status: JobApplicationStatus): string => {
    const statusLabels: Record<JobApplicationStatus, string> = {
      new: "Ny",
      reviewing: "Under vurdering",
      interviewed: "Intervjuet",
      offer_extended: "Tilbud sendt",
      hired: "Ansatt",
      rejected: "Avslått",
    };
    return statusLabels[status];
  };

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Jobbsøknader", isCurrentPage: true },
      ]}
    >
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Jobbsøknader</h1>
            <p className="text-muted-foreground mt-2">
              Administrer og følg opp innkomne jobbsøknader
            </p>
          </div>
          <Tabs
            defaultValue="kanban"
            value={view}
            onValueChange={(value) => setView(value as "table" | "kanban")}
          >
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span>Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <TableIcon className="h-4 w-4" />
                <span>Tabell</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center mb-6 w-full max-w-sm">
          <Input
            placeholder="Søk etter søknader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="mr-2"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Laster jobbsøknader...</p>
          </div>
        ) : view === "table" ? (
          <ApplicationTable
            applications={applications}
            isLoading={loading}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <ApplicationsKanban
            applications={applications}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>
    </PageLayout>
  );
}
