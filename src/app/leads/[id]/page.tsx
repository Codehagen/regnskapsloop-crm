import { PageLayout } from "@/components/page-layout";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Import server actions and utilities
import { getLeadById } from "@/app/actions/leads/actions";
import { getUserWorkspaceData } from "@/lib/auth/workspace";

// Import components
import LeadDetailClient from "@/components/lead/lead-detail-client";
import LeadDetailSkeleton from "@/components/lead/lead-detail-skeleton";

// Define props for the page
interface LeadDetailPageProps {
  params: { id: string };
}

// Make the page component async
export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;

  // Fetch workspace and lead data on the server
  let workspaceId: string = ""; // Initialize to avoid linter error
  let initialLead = null;

  try {
    const workspaceData = await getUserWorkspaceData();
    workspaceId = workspaceData.workspaceId;
    // Fetch lead using both id and workspaceId
    initialLead = await getLeadById(id, workspaceId);
  } catch (error) {
    console.error(`Error fetching data for lead ID ${id}:`, error);
    // Depending on the error, you might want to redirect, show a specific error page,
    // or just fall through to the notFound() logic below.
    // For now, we still rely on notFound() if initialLead remains null.
  }

  // Handle case where lead is not found for the given workspace
  if (!initialLead) {
    // Use Next.js notFound() for a standard 404 page
    notFound();
    // Or render a custom not found component:
    /*
    return (
      <>
        <PageHeader
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Leads", href: "/leads" },
          ]}
        />
        <main className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Fant ikke lead</h1>
          <p className="text-muted-foreground mb-6">
            Lead med ID {id} ble ikke funnet i din workspace.
          </p>
          <Button asChild>
            <a href="/leads">Tilbake til leads</a>
          </Button>
        </main>
      </>
    );
    */
  }

  // Render the PageHeader and the Client Component with fetched data
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Leads", href: "/leads" },
        { label: initialLead.name, isCurrentPage: true },
      ]}
    >
      <Suspense fallback={<LeadDetailSkeleton />}>
        <LeadDetailClient initialLead={initialLead} workspaceId={workspaceId} />
      </Suspense>
    </PageLayout>
  );
}
