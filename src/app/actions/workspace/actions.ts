"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Creates the initial workspace for a newly signed-up user.
 * This action should be called from the onboarding form.
 * @param formData The form data containing the workspace name.
 */
export async function createInitialWorkspace(formData: FormData) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("User is not authenticated.");
  }

  // Extract workspace name from FormData
  const workspaceName = formData.get("workspaceName") as string;

  if (!workspaceName || workspaceName.trim().length === 0) {
    // You might want more specific error handling/feedback here
    throw new Error("Workspace name cannot be empty.");
  }

  // Find user or create if they don't exist
  let user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, workspaces: { select: { id: true } } },
  });

  let isNewUser = false;
  if (!user) {
    console.log(
      `User ${clerkId} not found in createInitialWorkspace, attempting creation.`
    );
    const clerkUser = await currentUser();
    if (!clerkUser || !clerkUser.emailAddresses[0]?.emailAddress) {
      console.error(
        "Clerk user data missing during initial workspace creation"
      );
      throw new Error(
        "Could not retrieve your user details. Please try again."
      );
    }
    const primaryEmail = clerkUser.emailAddresses[0].emailAddress;

    try {
      user = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: primaryEmail,
          name:
            `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
            null,
          isAdmin: true, // New user creating first workspace is admin
        },
        select: { id: true, workspaces: { select: { id: true } } },
      });
      isNewUser = true;
      console.log(
        `Successfully created user ${clerkId} during workspace setup.`
      );
    } catch (error) {
      console.error("Failed to create user during workspace setup:", error);
      throw new Error("Could not create your user account. Please try again.");
    }
  }

  // At this point, user MUST exist (either found or created)

  // Check if the existing (or newly created) user already has a workspace
  if (!isNewUser && user.workspaces && user.workspaces.length > 0) {
    console.warn(
      `User ${clerkId} (ID: ${user.id}) attempted onboarding but already has a workspace. Redirecting.`
    );
    redirect("/");
  }

  try {
    // If user existed but wasn't admin (shouldn't happen in this flow, but safeguard)
    if (!isNewUser) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isAdmin: true }, // Ensure existing user becomes admin on first workspace creation
      });
    }

    // Create the workspace and connect the user
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: workspaceName.trim(),
        users: {
          connect: { id: user.id }, // Connect user via their DB id
        },
      },
    });

    console.log(
      `Created workspace '${newWorkspace.name}' (ID: ${newWorkspace.id}) for user ${clerkId} (DB ID: ${user.id})`
    );

    // Optional: Revalidate paths if needed, although redirecting is usually sufficient after onboarding
    // revalidatePath('/');
  } catch (error) {
    console.error("Failed to create initial workspace:", error);
    // Provide a more user-friendly error message
    throw new Error("Could not create your workspace. Please try again.");
  }

  // Redirect to the main application page after successful creation
  redirect("/");
}

/**
 * Gets the current user's workspace
 */
export async function getCurrentWorkspace() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("User is not authenticated.");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      workspaces: {
        select: { id: true, name: true },
        take: 1,
      },
    },
  });

  if (!user?.workspaces[0]) {
    throw new Error("No workspace found for user.");
  }

  return user.workspaces[0];
}
