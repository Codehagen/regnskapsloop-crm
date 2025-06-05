"use client";

import { useState, useEffect, useTransition } from "react";
import { LayoutGrid, Table as TableIcon, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/lead/data-table";
import { KanbanView } from "@/components/lead/kanban-view";
import { Business, CustomerStage } from "@/app/generated/prisma";
import { updateLeadStatus } from "@/app/actions/leads/actions"; // Use correct path
import { searchLeadsAction } from "@/app/actions/leads/searchLeadsAction"; // Import the search action
import { columns } from "@/components/lead/columns";
import { LeadsTableSkeleton } from "./leads-skeleton";
import { EmptyState } from "./empty-state";
import { KanbanSkeleton } from "./kanban-skeleton"; // Import Kanban Skeleton

interface LeadsClientProps {
  initialLeads: Business[];
  workspaceId: string;
}

// Helper function to get readable status labels (can be moved to utils if used elsewhere)
const getStageLabel = (stage: CustomerStage): string => {
  const stageLabels: Record<CustomerStage, string> = {
    lead: "Ny",
    prospect: "Kontaktet",
    qualified: "Kvalifisert",
    customer: "Kunde",
    churned: "Tapt",
  };
  return stageLabels[stage];
};

export default function LeadsClient({
  initialLeads,
  workspaceId,
}: LeadsClientProps) {
  // Track which view is active
  const [view, setView] = useState<"table" | "kanban">("kanban");

  // State to manage leads data - initialized with server-fetched data
  const [leads, setLeads] = useState<Business[]>(initialLeads);
  // Start in loading state to show skeleton initially
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition(); // For search loading state

  // Set loading to false after initial mount
  useEffect(() => {
    setLoading(false);
  }, []);

  // Re-sync leads state if initialLeads prop changes (e.g., after router.refresh)
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  // Function to update a lead's status
  const handleStatusChange = async (
    leadId: string,
    newStage: CustomerStage
  ) => {
    const leadToUpdate = leads.find((lead) => lead.id === leadId);
    if (!leadToUpdate) return;
    const oldStage = leadToUpdate.stage;
    const originalLeads = [...leads];

    try {
      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === leadId ? { ...lead, stage: newStage } : lead
        )
      );

      // Call server action WITH workspaceId
      await updateLeadStatus(leadId, newStage, workspaceId);

      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-medium">Lead status oppdatert</div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{leadToUpdate.name}</span> ble flyttet
            fra{" "}
            <Badge variant="outline" className="ml-1 mr-1">
              {getStageLabel(oldStage)}
            </Badge>
            <span>→</span>
            <Badge variant="outline" className="ml-1">
              {getStageLabel(newStage)}
            </Badge>
          </div>
        </div>
      );
    } catch (error) {
      setLeads(originalLeads);
      console.error("Error updating lead status:", error);
      toast.error("Failed to update lead status");
    }
  };

  // Function to handle search
  const handleSearch = () => {
    startTransition(async () => {
      try {
        const searchResults = await searchLeadsAction(searchTerm);
        setLeads(searchResults);
        if (searchResults.length === 0 && searchTerm !== "") {
          toast.info(`Ingen leads funnet for "${searchTerm}".`);
        } else if (searchTerm === "") {
          // Optional: Show a toast when clearing the search?
          // toast.info("Viser alle leads.");
        }
      } catch (error) {
        console.error("Search failed:", error);
        toast.error("Søk feilet. Prøv igjen.");
        // Optionally revert to initialLeads on error, or keep the current state
        // setLeads(initialLeads);
      }
    });
  };

  // Placeholder for triggering the 'Add Lead' form/modal
  const handleAddNewLead = () => {
    // TODO: Implement logic to open a modal or navigate to a 'new lead' page
    toast.info("Funksjonen 'Ny Lead' er ikke implementert enda.");
  };

  // Determine content based on state
  const renderContent = () => {
    // Show initial skeleton on mount (before client-side hydration/setup finishes)
    if (loading) {
      return view === "table" ? <LeadsTableSkeleton /> : <KanbanSkeleton />;
    }

    // Show skeleton loader while search is pending
    if (isPending) {
      return view === "table" ? <LeadsTableSkeleton /> : <KanbanSkeleton />;
    }

    // Handle empty state *after* search (if search term is present)
    if (leads.length === 0 && searchTerm !== "") {
      return (
        <EmptyState
          title={`Ingen resultater for "${searchTerm}"`}
          description="Prøv et annet søkeord eller tøm søkefeltet for å se alle leads."
          // No action needed here, the user can clear the search input
        />
      );
    }

    // Handle initial empty state (no leads in the workspace at all)
    if (leads.length === 0 && searchTerm === "") {
      return (
        <EmptyState
          title="Ingen leads funnet"
          description="Kom i gang ved å legge til din første lead."
          actionLabel="Legg til Lead"
          onAction={handleAddNewLead} // Connect to add lead action
        />
      );
    }

    if (view === "table") {
      return (
        <DataTable
          columns={columns}
          data={leads}
          searchColumn="name"
          searchPlaceholder="Søk etter navn..."
        />
      );
    }

    if (view === "kanban") {
      return <KanbanView leads={leads} onStatusChange={handleStatusChange} />;
    }

    return null; // Should not happen
  };

  return (
    <main>
      {/* Top controls: Search and View Switcher */}
      <div className="flex items-center justify-between mb-6">
        {/* Search Input */}
        <div className="flex items-center w-full max-w-sm">
          <Input
            placeholder="Søk etter leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="mr-2"
            disabled={isPending} // Disable input while searching
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleSearch}
            disabled={isPending}
          >
            {" "}
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* View Switcher Tabs */}
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

      {/* Main Content Area */}
      {renderContent()}
    </main>
  );
}
