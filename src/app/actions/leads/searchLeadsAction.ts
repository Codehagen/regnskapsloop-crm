"use server";

import { prisma } from "@/lib/db";
import { getUserWorkspaceData } from "@/lib/auth/workspace";
import { Business } from "@/app/generated/prisma";

export async function searchLeadsAction(query: string): Promise<Business[]> {
  try {
    const { workspaceId } = await getUserWorkspaceData();

    if (!workspaceId) {
      throw new Error("Workspace not found.");
    }

    if (!query) {
      // If the query is empty, return all leads for the workspace
      // This might need adjustment based on pagination/performance needs
      return await prisma.business.findMany({
        where: {
          workspaceId: workspaceId,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }

    const searchResults = await prisma.business.findMany({
      where: {
        workspaceId: workspaceId,
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            contactPerson: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            orgNumber: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return searchResults;
  } catch (error) {
    console.error("Error searching leads:", error);
    // In a real app, you might want more sophisticated error handling
    // or return an empty array/specific error object
    return [];
  }
}
