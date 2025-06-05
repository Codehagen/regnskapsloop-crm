import { getLeads } from "../actions/leads/actions";
import LeadsClient from "@/components/lead/leads-client";
import { getUserWorkspaceData } from "@/lib/auth/workspace";
import { AddLeadButtonWrapper } from "@/components/lead/add-lead-button-wrapper";
import { PageLayout } from "@/components/page-layout";
import React from "react";

export default async function LeadsPage() {
  const { userId, workspaceId } = await getUserWorkspaceData();
  const initialLeads = await getLeads(workspaceId);

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Leads", isCurrentPage: true },
      ]}
    >
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground mt-2">
              Håndter potensielle kunder og salgsmuligheter her.
            </p>
          </div>
          <AddLeadButtonWrapper workspaceId={workspaceId} />
        </div>
        <LeadsClient initialLeads={initialLeads} workspaceId={workspaceId} />
      </main>
    </PageLayout>
  );
}
