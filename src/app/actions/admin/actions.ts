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

// Schema for user profile update by admin
const adminUserUpdateSchema = z.object({
  userId: z.string().cuid("Ugyldig bruker ID"),
  name: z.string().min(1, "Navn er påkrevd").optional(),
  isAdmin: z.boolean().optional(),
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

/**
 * Update user profile by admin - Super admin only
 */
export async function updateUserProfile(formData: FormData) {
  const isAdmin = await isSuperAdmin();
  if (!isAdmin) {
    return { success: false, message: "Ingen tilgang" };
  }

  const userId = formData.get("userId") as string;
  const name = formData.get("name") as string;
  const isAdminStr = formData.get("isAdmin") as string;

  const validatedFields = adminUserUpdateSchema.safeParse({
    userId,
    name: name || undefined,
    isAdmin: isAdminStr ? isAdminStr === "true" : undefined,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validering feilet",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Build update data object
    const updateData: any = {};
    if (validatedFields.data.name !== undefined) {
      updateData.name = validatedFields.data.name;
    }
    if (validatedFields.data.isAdmin !== undefined) {
      updateData.isAdmin = validatedFields.data.isAdmin;
    }

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: "Ingen endringer å lagre",
      };
    }

    await prisma.user.update({
      where: { id: validatedFields.data.userId },
      data: updateData,
    });

    revalidatePath("/admin");
    return {
      success: true,
      message: "Brukerprofil oppdatert",
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      message: "Kunne ikke oppdatere brukerprofil",
      error: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}

/**
 * Get system-wide analytics and metrics - Super admin only
 */
export async function getSystemAnalytics() {
  const isAdmin = await isSuperAdmin();
  if (!isAdmin) {
    return { success: false, message: "Ingen tilgang", data: null };
  }

  try {
    // Get all counts in parallel
    const [
      totalUsers,
      totalWorkspaces,
      totalBusinesses,
      totalLeads,
      totalCustomers,
      totalActivities,
      totalOffers,
      totalEmails,
      totalTasks,
      totalJobApplications,
      recentUsers,
      activeWorkspaces,
      industryStats,
      municipalityStats,
      recentBusinesses,
    ] = await Promise.all([
      // Basic counts
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.business.count(),
      prisma.business.count({ where: { stage: "lead" } }),
      prisma.business.count({ where: { stage: "customer" } }),
      prisma.activity.count(),
      prisma.offer.count(),
      prisma.email.count(),
      prisma.task.count(),
      prisma.jobApplication.count(),

      // Recent activity
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),

      // Active workspaces (with activity in last 30 days)
      prisma.workspace.count({
        where: {
          activities: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      }),

      // Industry distribution (top 10)
      prisma.business.groupBy({
        by: ["industryCode"],
        _count: true,
        where: {
          industryCode: { not: null },
        },
        orderBy: {
          _count: {
            industryCode: "desc",
          },
        },
        take: 10,
      }),

      // Municipality distribution (top 10)
      prisma.business.groupBy({
        by: ["city"],
        _count: true,
        where: {
          city: { not: null },
        },
        orderBy: {
          _count: {
            city: "desc",
          },
        },
        take: 10,
      }),

      // Recent business growth (last 6 months)
      prisma.business.groupBy({
        by: ["createdAt"],
        _count: true,
        where: {
          createdAt: {
            gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? (totalCustomers / (totalLeads + totalCustomers)) * 100 : 0;

    // Calculate potential value
    const potentialValueResult = await prisma.business.aggregate({
      _sum: {
        potensiellVerdi: true,
      },
      where: {
        stage: "lead",
        potensiellVerdi: { not: null },
      },
    });

    // Calculate accepted offers value
    const acceptedOffersResult = await prisma.offer.aggregate({
      _sum: {
        totalAmount: true,
      },
      _count: true,
      where: {
        status: "accepted",
      },
    });

    return {
      success: true,
      data: {
        // Basic metrics
        totalUsers,
        totalWorkspaces,
        totalBusinesses,
        totalLeads,
        totalCustomers,
        totalActivities,
        totalOffers,
        totalEmails,
        totalTasks,
        totalJobApplications,
        
        // Growth metrics
        recentUsers,
        activeWorkspaces,
        conversionRate: Math.round(conversionRate * 100) / 100,
        
        // Financial metrics
        totalPotentialValue: potentialValueResult._sum.potensiellVerdi || 0,
        totalAcceptedOffersValue: acceptedOffersResult._sum.totalAmount || 0,
        acceptedOffersCount: acceptedOffersResult._count,
        
        // Distribution stats
        industryStats: industryStats.map(stat => ({
          industry: stat.industryCode,
          count: stat._count,
        })),
        municipalityStats: municipalityStats.map(stat => ({
          municipality: stat.city,
          count: stat._count,
        })),
        
        // Growth trends
        businessGrowth: recentBusinesses,
      },
    };
  } catch (error) {
    console.error("Error fetching system analytics:", error);
    return {
      success: false,
      message: "Kunne ikke hente systemanalyse",
      data: null,
      error: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}

/**
 * Get BRREG integration status and metrics - Super admin only
 */
export async function getBrregStatus() {
  const isAdmin = await isSuperAdmin();
  if (!isAdmin) {
    return { success: false, message: "Ingen tilgang", data: null };
  }

  try {
    // Count BRREG businesses
    const totalBrregBusinesses = await prisma.brregBusiness.count();
    
    // Count businesses with BRREG link
    const businessesWithBrreg = await prisma.business.count({
      where: {
        brregOrgNumber: { not: null },
      },
    });

    // Get latest BRREG updates
    const latestBrregUpdate = await prisma.brregBusiness.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        updatedAt: true,
      },
    });

    // Count businesses by organization form
    const orgFormStats = await prisma.brregBusiness.groupBy({
      by: ["orgFormCode"],
      _count: true,
      where: {
        orgFormCode: { not: null },
      },
      orderBy: {
        _count: {
          orgFormCode: "desc",
        },
      },
      take: 10,
    });

    // Data quality metrics
    const incompleteRecords = await prisma.brregBusiness.count({
      where: {
        OR: [
          { email: null },
          { phone: null },
          { businessAddress: null },
        ],
      },
    });

    return {
      success: true,
      data: {
        totalBrregBusinesses,
        businessesWithBrreg,
        latestUpdate: latestBrregUpdate?.updatedAt,
        dataQuality: {
          incompleteRecords,
          completionRate: Math.round(((totalBrregBusinesses - incompleteRecords) / totalBrregBusinesses) * 100),
        },
        orgFormDistribution: orgFormStats.map(stat => ({
          orgForm: stat.orgFormCode,
          count: stat._count,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching BRREG status:", error);
    return {
      success: false,
      message: "Kunne ikke hente BRREG-status",
      data: null,
      error: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}