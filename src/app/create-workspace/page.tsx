import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createInitialWorkspace } from "@/app/actions/workspace/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/db";

// Helper function to suggest name from email
function suggestNameFromEmail(email: string): string {
  if (!email || !email.includes("@")) {
    return "";
  }
  const domainPart = email.substring(email.lastIndexOf("@") + 1);
  const namePart = domainPart.split(".")[0]; // Get part before first dot

  // Simple capitalization
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}

export default async function CreateWorkspacePage() {
  const user = await currentUser();

  if (!user) {
    // Should be handled by middleware, but redirect just in case
    redirect("/sign-in");
  }

  // Pre-check: If user somehow lands here but already has a workspace, redirect them
  // This requires another DB call, but ensures robustness
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { workspaces: { select: { id: true } } },
  });
  if (dbUser?.workspaces && dbUser.workspaces.length > 0) {
    console.log("User already has a workspace, redirecting from onboarding.");
    redirect("/");
  }

  const suggestedName = suggestNameFromEmail(
    user.emailAddresses[0]?.emailAddress || ""
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <form action={createInitialWorkspace}>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Velkommen!</CardTitle>
            <CardDescription>
              La oss sette opp din første arbeidsflate. Hva heter bedriften din?
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="workspaceName">Bedriftsnavn</Label>
              <Input
                id="workspaceName"
                name="workspaceName" // Important: name attribute must match action parameter
                type="text"
                placeholder="F.eks. Min Bedrift AS"
                defaultValue={suggestedName}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Opprett Arbeidsflate
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
