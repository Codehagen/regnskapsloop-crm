import { getCustomers } from "../actions/customers/actions";
import { getUserWorkspaceData } from "@/lib/auth/workspace";
import CustomersClient from "@/components/customer/customers-client";
import { PageLayout } from "@/components/page-layout";

export default async function CustomersPage() {
  const { workspaceId } = await getUserWorkspaceData();
  const customers = await getCustomers(workspaceId);

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Kunder", isCurrentPage: true },
      ]}
    >
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kunder</h1>
            <p className="text-muted-foreground mt-2">
              Oversikt over dine kunder.
            </p>
          </div>
        </div>
        <CustomersClient initialCustomers={customers} />
      </main>
    </PageLayout>
  );
}
