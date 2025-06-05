import { PageLayout } from "@/components/page-layout";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Import server actions and utilities
import { getCustomerById } from "@/app/actions/customers/actions";
import { getUserWorkspaceData } from "@/lib/auth/workspace";

// Import components - using the lead detail client since it's the same data structure
import LeadDetailClient from "@/components/lead/lead-detail-client";
import LeadDetailSkeleton from "@/components/lead/lead-detail-skeleton";

// Define props for the page
interface CustomerDetailPageProps {
  params: { id: string };
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = await params;

  // Fetch workspace and customer data on the server
  let workspaceId: string = ""; // Initialize to avoid linter error
  let initialCustomer = null;

  try {
    const workspaceData = await getUserWorkspaceData();
    workspaceId = workspaceData.workspaceId;
    // Fetch customer using both id and workspaceId
    initialCustomer = await getCustomerById(id, workspaceId);
  } catch (error) {
    console.error(`Error fetching data for customer ID ${id}:`, error);
    // Depending on the error, you might want to redirect, show a specific error page,
    // or just fall through to the notFound() logic below.
    // For now, we still rely on notFound() if initialCustomer remains null.
  }

  // Handle case where customer is not found for the given workspace
  if (!initialCustomer) {
    // Use Next.js notFound() for a standard 404 page
    notFound();
  }

  // Render the PageHeader and the Client Component with fetched data
  // Using LeadDetailClient since customers and leads use the same Business entity
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Kunder", href: "/customers" },
        { label: initialCustomer.name, isCurrentPage: true },
      ]}
    >
      <Suspense fallback={<LeadDetailSkeleton />}>
        <LeadDetailClient
          initialLead={initialCustomer}
          workspaceId={workspaceId}
        />
      </Suspense>
    </PageLayout>
  );
}
