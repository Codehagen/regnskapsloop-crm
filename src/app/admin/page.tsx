import { Metadata } from "next";
import { getAllUsers, getAllWorkspaces } from "@/app/actions/admin/actions";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { WorkspaceOverview } from "@/components/admin/workspace-overview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Administratorpanel",
  description: "Administrer brukere og arbeidsområder",
};

export default async function AdminPage() {
  // Fetch all users and workspaces
  const [usersResult, workspacesResult] = await Promise.all([
    getAllUsers(),
    getAllWorkspaces(),
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

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Brukere</TabsTrigger>
          <TabsTrigger value="workspaces">Arbeidsområder</TabsTrigger>
        </TabsList>

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