"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

/**
 * Fetches the current authenticated user's associated workspace ID.
 * Redirects to sign-in if not authenticated, or to onboarding if no user record
 * or no workspace is found.
 *
 * @returns {Promise<{ userId: string; workspaceId: string }>} The user's database ID and their first workspace ID.
 * @throws Error if Clerk data is missing unexpectedly.
 */
export async function getUserWorkspaceData() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  // Attempt to find the user and their first workspace in the database
  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      name: true,
      email: true,
      workspaces: { select: { id: true, name: true }, take: 1 },
    },
  });

  // If user record doesn't exist OR user exists but has no workspaces
  if (!dbUser || !dbUser.workspaces || dbUser.workspaces.length === 0) {
    console.log(
      `User ${clerkId} ${
        dbUser ? `(ID: ${dbUser.id})` : "(not found)"
      } needs workspace. Redirecting to onboarding.`
    );
    redirect("/create-workspace");
  }

  // If checks pass, user exists and has at least one workspace
  return {
    userId: dbUser.id,
    workspaceId: dbUser.workspaces[0].id,
    userName: dbUser.name ?? undefined,
    userEmail: dbUser.email,
    workspaceName: dbUser.workspaces[0].name,
  };
}
