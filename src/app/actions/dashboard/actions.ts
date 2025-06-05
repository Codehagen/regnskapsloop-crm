"use server";

import { prisma } from "@/lib/db";
import { CustomerStage } from "@/app/generated/prisma";

export async function getDashboardData(workspaceId: string) {
  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }

  const [leadsCount, prospectsCount, qualifiedCount, customersCount] =
    await Promise.all([
      prisma.business.count({
        where: { workspaceId, stage: CustomerStage.lead },
      }),
      prisma.business.count({
        where: { workspaceId, stage: CustomerStage.prospect },
      }),
      prisma.business.count({
        where: { workspaceId, stage: CustomerStage.qualified },
      }),
      prisma.business.count({
        where: { workspaceId, stage: CustomerStage.customer },
      }),
    ]);

  const recentLeadsPromise = prisma.business.findMany({
    where: {
      workspaceId,
      stage: {
        in: [
          CustomerStage.lead,
          CustomerStage.prospect,
          CustomerStage.qualified,
        ],
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const potentialValuePromise = prisma.business.aggregate({
    where: {
      workspaceId,
      stage: {
        in: [
          CustomerStage.lead,
          CustomerStage.prospect,
          CustomerStage.qualified,
        ],
      },
      potensiellVerdi: { not: null },
    },
    _sum: {
      potensiellVerdi: true,
    },
  });

  const topLeadsPromise = prisma.business.findMany({
    where: {
      workspaceId,
      stage: {
        in: [
          CustomerStage.lead,
          CustomerStage.prospect,
          CustomerStage.qualified,
        ],
      },
      potensiellVerdi: { gt: 0 },
    },
    orderBy: { potensiellVerdi: "desc" },
    take: 5,
  });

  const upcomingActivitiesPromise = prisma.activity.findMany({
    where: {
      workspaceId,
      date: { gte: new Date() },
      completed: false,
    },
    orderBy: { date: "asc" },
    take: 5,
    include: {
      business: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } },
    },
  });

  const recentActivitiesPromise = prisma.activity.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 7,
    include: {
      business: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
    },
  });

  const [
    recentLeads,
    potentialValueResult,
    topLeads,
    upcomingActivities,
    recentActivities,
  ] = await Promise.all([
    recentLeadsPromise,
    potentialValuePromise,
    topLeadsPromise,
    upcomingActivitiesPromise,
    recentActivitiesPromise,
  ]);

  const totalPotentialValue = potentialValueResult._sum.potensiellVerdi || 0;

  return {
    leadsCount,
    prospectsCount,
    qualifiedCount,
    customersCount,
    recentLeads,
    totalPotentialValue,
    topLeads,
    upcomingActivities,
    recentActivities,
  };
}
