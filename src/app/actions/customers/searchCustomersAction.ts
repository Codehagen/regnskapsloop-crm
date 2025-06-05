"use server";

import { prisma } from "@/lib/db";
import { getUserWorkspaceData } from "@/lib/auth/workspace";
import { Business, CustomerStage } from "@/app/generated/prisma";

export async function searchCustomersAction(query: string): Promise<Business[]> {
  try {
    const { workspaceId } = await getUserWorkspaceData();

    if (!workspaceId) {
      throw new Error("Workspace not found.");
    }

    if (!query) {
      return await prisma.business.findMany({
        where: {
          workspaceId,
          stage: CustomerStage.customer,
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    const searchResults = await prisma.business.findMany({
      where: {
        workspaceId,
        stage: CustomerStage.customer,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { contactPerson: { contains: query, mode: "insensitive" } },
          { orgNumber: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
    });

    return searchResults;
  } catch (error) {
    console.error("Error searching customers:", error);
    return [];
  }
}
