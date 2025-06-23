import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server"; // Import currentUser
import { ProfileForm } from "@/components/settings/profile-form"; // Import the form
import {
  isCurrentUserWorkspaceAdmin,
  // Assuming a function to get workspace details might be here or elsewhere
  // getWorkspaceDetails, // Placeholder idea
} from "@/app/actions/settings/actions"; // Import admin check
import { redirect } from "next/navigation";
import { WorkspaceForm } from "@/components/settings/workspace-form"; // Import WorkspaceForm
import { InviteForm } from "@/components/settings/invite-form";
import { prisma } from "@/lib/db"; // Import prisma for fetching workspace details

export const metadata: Metadata = {
  title: "Innstillinger",
  description: "Administrer konto- og arbeidsområdeinnstillinger.",
};

// Placeholder function - replace with your actual logic
async function getActiveWorkspaceIdForUser(
  userId: string
): Promise<string | null> {
  // Example: Fetch the first workspace the user belongs to
  const userWithWorkspace = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { workspaces: { take: 1, select: { id: true } } },
  });
  return userWithWorkspace?.workspaces[0]?.id || null;
}

export default async function SettingsPage() {
  const user = await currentUser();

  if (!user) {
    // Should be handled by middleware, but good practice
    redirect("/sign-in");
  }

  // --- Fetch Workspace and Admin Status ---
  const activeWorkspaceId = await getActiveWorkspaceIdForUser(user.id);
  let isWorkspaceAdmin = false;
  let workspaceData: { id: string; name: string } | null = null;

  if (activeWorkspaceId) {
    isWorkspaceAdmin = await isCurrentUserWorkspaceAdmin(activeWorkspaceId);
    // Fetch workspace details if user is admin (or always, depending on needs)
    // if (isWorkspaceAdmin) { // Or fetch regardless of admin status if name needed elsewhere
    workspaceData = await prisma.workspace.findUnique({
      where: { id: activeWorkspaceId },
      select: { id: true, name: true },
    });
    // }
  } else {
    // Handle case where user has no active workspace? Show a message?
    console.warn(`User ${user.id} has no active workspace.`);
    // Potentially redirect or show an error/setup state
  }

  // Prepare user data for the form
  const profileData = {
    id: user.id,
    name: user.firstName || user.username, // Use firstName or username
    email: user.emailAddresses[0]?.emailAddress, // Get primary email
  };

  return (
    <div className="space-y-6 p-4 md:p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Innstillinger</h2>
        <p className="text-muted-foreground">
          Administrer konto- og arbeidsområdeinnstillingene dine.
        </p>
      </div>
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          {/* Conditionally render workspace tab based on admin status AND if workspace exists */}
          {isWorkspaceAdmin && workspaceData && (
            <TabsTrigger value="workspace">Arbeidsområde</TabsTrigger>
          )}
          {/* Add future tabs here (e.g., Billing, Integrations) */}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          {/* Integrate the ProfileForm */}
          <ProfileForm user={profileData} />
        </TabsContent>

        {/* Conditionally render workspace content */}
        {isWorkspaceAdmin && workspaceData && (
          <TabsContent value="workspace" className="space-y-4">
            {/* Integrate the WorkspaceForm */}
            <WorkspaceForm workspace={workspaceData} />
            <InviteForm workspaceId={workspaceData.id} />
            {/* Other workspace settings components will go here later */}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
