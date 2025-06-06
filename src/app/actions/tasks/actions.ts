"use server";

import { prisma } from "@/lib/db";
import { TaskStatus } from "@/app/generated/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getTasks(workspaceId: string, userId?: string) {
  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }
  return prisma.task.findMany({
    where: {
      workspaceId,
      ...(userId ? { assignees: { some: { id: userId } } } : {}),
    },
    include: {
      assignees: true,
      business: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.coerce.date().optional(),
  workspaceId: z.string().min(1),
  businessId: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
});

export async function createTask(values: z.infer<typeof createTaskSchema>) {
  const validated = createTaskSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, message: "Validation failed" };
  }
  const data = validated.data;
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      dueDate: data.dueDate || undefined,
      workspaceId: data.workspaceId,
      businessId: data.businessId || undefined,
      assignees: data.assigneeIds
        ? { connect: data.assigneeIds.map((id) => ({ id })) }
        : undefined,
    },
    include: { assignees: true },
  });
  revalidatePath("/tasks");
  if (data.businessId) {
    revalidatePath(`/leads/${data.businessId}`);
  }
  return { success: true, data: task };
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  workspaceId: string
) {
  if (!taskId || !workspaceId) {
    throw new Error("Task ID and Workspace ID are required");
  }
  const updated = await prisma.task.update({
    where: { id: taskId, workspaceId },
    data: { status },
  });
  revalidatePath("/tasks");
  if (updated.businessId) {
    revalidatePath(`/leads/${updated.businessId}`);
  }
  return updated;
}

export async function getWorkspaceUsers(workspaceId: string) {
  return prisma.user.findMany({
    where: { workspaces: { some: { id: workspaceId } } },
    select: { id: true, name: true, email: true },
  });
}
