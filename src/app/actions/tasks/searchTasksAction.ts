"use server";

import { prisma } from "@/lib/db";
import { getUserWorkspaceData } from "@/lib/auth/workspace";
import { Task } from "@/app/generated/prisma";

export async function searchTasksAction(
  query: string,
  userId?: string
): Promise<Task[]> {
  try {
    const { workspaceId } = await getUserWorkspaceData();

    if (!workspaceId) {
      throw new Error("Workspace not found.");
    }

    if (!query) {
      // If the query is empty, return all tasks for the workspace
      return await prisma.task.findMany({
        where: {
          workspaceId: workspaceId,
          ...(userId ? { assignees: { some: { id: userId } } } : {}),
        },
        include: {
          assignees: true,
          business: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }

    const searchResults = await prisma.task.findMany({
      where: {
        workspaceId: workspaceId,
        ...(userId ? { assignees: { some: { id: userId } } } : {}),
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            business: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
          {
            assignees: {
              some: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },
      include: {
        assignees: true,
        business: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return searchResults;
  } catch (error) {
    console.error("Error searching tasks:", error);
    return [];
  }
}
