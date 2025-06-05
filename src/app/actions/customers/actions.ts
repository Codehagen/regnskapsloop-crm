"use server";

import { prisma } from "@/lib/db";
import { Business, CustomerStage } from "@/app/generated/prisma";

export async function getCustomers(workspaceId: string): Promise<Business[]> {
  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }
  try {
    return await prisma.business.findMany({
      where: { workspaceId, stage: CustomerStage.customer },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error(
      `Error fetching customers for workspace ${workspaceId}:`,
      error
    );
    throw new Error("Failed to fetch customers");
  }
}

// Get a specific customer by ID within a specific workspace
export async function getCustomerById(
  id: string,
  workspaceId: string
): Promise<Business | null> {
  if (!id || !workspaceId) {
    throw new Error("Customer ID and Workspace ID are required");
  }
  try {
    return await prisma.business.findUnique({
      where: {
        id: id,
        workspaceId: workspaceId,
      },
    });
  } catch (error) {
    console.error(
      `Error fetching customer ${id} for workspace ${workspaceId}:`,
      error
    );
    throw new Error("Failed to fetch customer details");
  }
}
