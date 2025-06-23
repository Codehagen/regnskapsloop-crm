"use server";
import { prisma } from "@/lib/db";
import { Business } from "@/app/generated/prisma";

export async function getBrregBusinesses(limit: number = 10): Promise<Business[]> {
  return prisma.business.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}
