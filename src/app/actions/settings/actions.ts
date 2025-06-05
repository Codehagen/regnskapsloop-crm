"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for validating profile updates
const profileUpdateSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd").optional(), // Allow optional updates
  // Email update might require Clerk specific handling, TBD
});

export async function updateUserProfile(formData: FormData) {
  const user = await currentUser();
  if (!user) {
    return { success: false, message: "Bruker ikke autentisert" };
  }

  const validatedFields = profileUpdateSchema.safeParse({
    name: formData.get("name") || undefined, // Handle empty string as undefined
  });

  if (!validatedFields.success) {
    console.error(
      "Validation failed:",
      validatedFields.error.flatten().fieldErrors
    );
    return {
      success: false,
      message: "Validering feilet",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name } = validatedFields.data;

  try {
    // Update user in local database
    // Note: Updating email might need Clerk API calls if email is managed there primarily
    await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        name: name,
        // Potentially add email update logic here after verifying Clerk setup
      },
    });

    console.log(`User profile updated for clerkId: ${user.id}`);
    revalidatePath("/settings"); // Revalidate the settings page

    return {
      success: true,
      message: "Profil oppdatert!",
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      message: "Kunne ikke oppdatere profil",
      error: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}

// --- Workspace Actions ---

export async function isCurrentUserWorkspaceAdmin(
  workspaceId: string // Keep workspaceId for context, though not used in this simple check
): Promise<boolean> {
  const user = await currentUser();
  if (!user) {
    console.log("isCurrentUserWorkspaceAdmin: User not authenticated.");
    return false; // Not authenticated, not an admin
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { isAdmin: true, workspaces: { where: { id: workspaceId } } }, // Check isAdmin and if user is part of the workspace
    });

    if (!dbUser) {
      console.log(
        `isCurrentUserWorkspaceAdmin: User with clerkId ${user.id} not found in DB.`
      );
      return false; // User not found in local DB
    }

    // For this implementation, we only check the global isAdmin flag.
    // We also check if the user is actually part of the workspace queried.
    const isMember = dbUser.workspaces.length > 0;
    if (!isMember) {
      console.log(
        `isCurrentUserWorkspaceAdmin: User ${user.id} is not a member of workspace ${workspaceId}.`
      );
      return false;
    }

    console.log(
      `isCurrentUserWorkspaceAdmin check for user ${user.id} in workspace ${workspaceId}: isAdmin=${dbUser.isAdmin}`
    );
    return dbUser.isAdmin ?? false; // Return the global admin status if they are a member
  } catch (error) {
    console.error(
      `Error checking admin status for user ${user.id} in workspace ${workspaceId}:`,
      error
    );
    return false; // Default to false on error
  }
}

// Schema for validating workspace name updates
const workspaceNameUpdateSchema = z.object({
  workspaceId: z.string().cuid("Ugyldig arbeidsområde ID"),
  name: z.string().min(1, "Navn på arbeidsområde er påkrevd"),
});

export async function updateWorkspaceName(formData: FormData) {
  const workspaceId = formData.get("workspaceId") as string;
  const name = formData.get("name") as string;

  // 1. Authentication & Authorization Check
  const user = await currentUser();
  if (!user) {
    return { success: false, message: "Bruker ikke autentisert" };
  }

  const isAdmin = await isCurrentUserWorkspaceAdmin(workspaceId);
  if (!isAdmin) {
    return {
      success: false,
      message: "Ingen tilgang til å endre arbeidsområde",
    };
  }

  // 2. Validation
  const validatedFields = workspaceNameUpdateSchema.safeParse({
    workspaceId,
    name,
  });

  if (!validatedFields.success) {
    console.error(
      "Workspace name update validation failed:",
      validatedFields.error.flatten().fieldErrors
    );
    return {
      success: false,
      message: "Validering feilet",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 3. Database Update
  try {
    await prisma.workspace.update({
      where: {
        id: validatedFields.data.workspaceId,
        // Optional: Add another condition to ensure the user is part of this workspace if needed
        // users: { some: { clerkId: user.id } } // This might be redundant due to isAdmin check
      },
      data: {
        name: validatedFields.data.name,
      },
    });

    console.log(
      `Workspace ${validatedFields.data.workspaceId} name updated to "${validatedFields.data.name}" by user ${user.id}`
    );
    revalidatePath("/settings"); // Revalidate the settings page
    // Potentially revalidate other paths if the workspace name is displayed elsewhere

    return {
      success: true,
      message: "Navn på arbeidsområde oppdatert!",
    };
  } catch (error) {
    console.error("Error updating workspace name:", error);
    // TODO: Handle potential Prisma errors (e.g., workspace not found)
    return {
      success: false,
      message: "Kunne ikke oppdatere navn på arbeidsområde",
      error: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}
