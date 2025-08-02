import { Metadata } from "next";
import { getAllUsers, getAllWorkspaces, getSystemAnalytics, getBrregStatus } from "@/app/actions/admin/actions";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { WorkspaceOverview } from "@/components/admin/workspace-overview";
import { SystemAnalytics } from "@/components/admin/system-analytics";
import { BrregMonitoring } from "@/components/admin/brreg-monitoring";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Administratorpanel",
  description: "Administrer brukere og arbeidsområder",
};

export default async function AdminPage() {
  // Fetch all data in parallel
  const [usersResult, workspacesResult, analyticsResult, brregResult] = await Promise.all([
    getAllUsers(),
    getAllWorkspaces(),
    getSystemAnalytics(),
    getBrregStatus(),
  ]);

  if (!usersResult.success) {
    return (
      <div className="p-4 md:p-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Ingen tilgang</h1>
          <p className="text-muted-foreground mt-2">
            Du har ikke tilgang til administratorpanelet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Administratorpanel</h2>
        <p className="text-muted-foreground">
          Administrer brukere og arbeidsområder på tvers av hele systemet.
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analyse</TabsTrigger>
          <TabsTrigger value="brreg">BRREG</TabsTrigger>
          <TabsTrigger value="users">Brukere</TabsTrigger>
          <TabsTrigger value="workspaces">Arbeidsområder</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          {analyticsResult.success && analyticsResult.data ? (
            <SystemAnalytics data={analyticsResult.data} />
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                Kunne ikke laste systemanalyse: {analyticsResult.message}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="brreg" className="space-y-4">
          {brregResult.success && brregResult.data ? (
            <BrregMonitoring data={brregResult.data} />
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                Kunne ikke laste BRREG-status: {brregResult.message}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserManagementTable 
            users={usersResult.data} 
            workspaces={workspacesResult.success ? workspacesResult.data : []}
          />
        </TabsContent>

        <TabsContent value="workspaces" className="space-y-4">
          <WorkspaceOverview 
            workspaces={workspacesResult.success ? workspacesResult.data : []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}