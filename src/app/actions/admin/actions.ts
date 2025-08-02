"use server";

import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for user-workspace assignment
const userWorkspaceSchema = z.object({
  userId: z.string().cuid("Ugyldig bruker ID"),
  workspaceId: z.string().cuid("Ugyldig arbeidsområde ID"),
});

// Schema for user admin toggle
const userAdminSchema = z.object({
  userId: z.string().cuid("Ugyldig bruker ID"),
  isAdmin: z.boolean(),
});

/**
 * Get all users with their workspaces - Super admin only
 */
export async function getAllUsers() {
  const isAdmin = await isSuperAdmin();
  if (!isAdmin) {
    return { success: false, message: "Ingen tilgang", data: [] };
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        workspaces: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        email: "asc",
      },
    });

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error("Error fetching all users:", error);
    return {
      success: false,
      message: "Kunne ikke hente brukere",
      data: [],
      error: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}

/**
 * Get all workspaces - Super admin only
 */
export async function getAllWorkspaces() {
  const isAdmin = await isSuperAdmin();
  if (!isAdmin) {
    return { success: false, message: "Ingen tilgang", data: [] };
  }

  try {
    const workspaces = await prisma.workspace.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: workspaces,
    };
  } catch (error) {
    console.error("Error fetching all workspaces:", error);
    return {
      success: false,
      message: "Kunne ikke hente arbeidsområder",
      data: [],
      error: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}

/**
 * Assign user to workspace - Super admin only
 */
export async function assignUserToWorkspace(formData: FormData) {
  const isAdmin = await isSuperAdmin();
  if (!isAdmin) {
    return { success: false, message: "Ingen tilgang" };
  }

  const userId = formData.get("userId") as string;
  const workspaceId = formData.get("workspaceId") as string;

  const validatedFields = userWorkspaceSchema.safeParse({
    userId,
    workspaceId,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validering feilet",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Check if user is already in workspace
    const existingRelation = await prisma.user.findFirst({
      where: {
        id: validatedFields.data.userId,
        workspaces: {
          some: {
            id: validatedFields.data.workspaceId,
          },
        },
      },
    });

    if (existingRelation) {
      return {
        success: false,
        message: "Bruker er allerede i dette arbeidsområdet",
      };
    }

    // Add user to workspace
    await prisma.user.update({
      where: { id: validatedFields.data.userId },
      data: {
        workspaces: {
          connect: { id: validatedFields.data.workspaceId },
        },
      },
    });

    revalidatePath("/admin");
    return {
      success: true,
      message: "Bruker lagt til i arbeidsområde",
    };
  } catch (error) {
    console.error("Error assigning user to workspace:", error);
    return {
      success: false,
      message: "Kunne ikke legge til bruker i arbeidsområde",
      error: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}

/**
 * Remove user from workspace - Super admin only
 */
export async function removeUserFromWorkspace(formData: FormData) {
  const isAdmin = await isSuperAdmin();
  if (!isAdmin) {
    return { success: false, message: "Ingen tilgang" };
  }

  const userId = formData.get("userId") as string;
  const workspaceId = formData.get("workspaceId") as string;

  const validatedFields = userWorkspaceSchema.safeParse({
    userId,
    workspaceId,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validering feilet",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Remove user from workspace
    await prisma.user.update({
      where: { id: validatedFields.data.userId },
      data: {
        workspaces: {
          disconnect: { id: validatedFields.data.workspaceId },
        },
      },
    });

    revalidatePath("/admin");
    return {
      success: true,
      message: "Bruker fjernet fra arbeidsområde",
    };
  } catch (error) {
    console.error("Error removing user from workspace:", error);
    return {
      success: false,
      message: "Kunne ikke fjerne bruker fra arbeidsområde",
      error: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}

/**
 * Toggle user admin status - Super admin only
 */
export async function toggleUserAdminStatus(formData: FormData) {
  const isAdmin = await isSuperAdmin();
  if (!isAdmin) {
    return { success: false, message: "Ingen tilgang" };
  }

  const userId = formData.get("userId") as string;
  const isAdminStr = formData.get("isAdmin") as string;

  const validatedFields = userAdminSchema.safeParse({
    userId,
    isAdmin: isAdminStr === "true",
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validering feilet",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.user.update({
      where: { id: validatedFields.data.userId },
      data: {
        isAdmin: validatedFields.data.isAdmin,
      },
    });

    revalidatePath("/admin");
    return {
      success: true,
      message: `Bruker ${
        validatedFields.data.isAdmin ? "gitt" : "fjernet"
      } administrator-rettigheter`,
    };
  } catch (error) {
    console.error("Error toggling user admin status:", error);
    return {
      success: false,
      message: "Kunne ikke endre administrator-status",
      error: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}