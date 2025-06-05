import { prisma } from "@/lib/db";
import { Lead, LeadStatus } from "@/app/generated/prisma";

export interface CreateLeadInput {
  navn: string;
  epost: string;
  telefon: string;
  selskap?: string;
  status: LeadStatus;
  potensiellVerdi: number;
}

export interface UpdateLeadInput {
  navn?: string;
  epost?: string;
  telefon?: string;
  selskap?: string;
  status?: LeadStatus;
  potensiellVerdi?: number;
}

export const leadService = {
  /**
   * Get all leads
   */
  getAllLeads: async (): Promise<Lead[]> => {
    return prisma.lead.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Get a lead by ID
   */
  getLeadById: async (id: string): Promise<Lead | null> => {
    return prisma.lead.findUnique({
      where: { id },
    });
  },

  /**
   * Create a new lead
   */
  createLead: async (data: CreateLeadInput): Promise<Lead> => {
    return prisma.lead.create({
      data,
    });
  },

  /**
   * Update a lead
   */
  updateLead: async (id: string, data: UpdateLeadInput): Promise<Lead> => {
    return prisma.lead.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a lead
   */
  deleteLead: async (id: string): Promise<Lead> => {
    return prisma.lead.delete({
      where: { id },
    });
  },

  /**
   * Update lead status
   */
  updateLeadStatus: async (id: string, status: LeadStatus): Promise<Lead> => {
    return prisma.lead.update({
      where: { id },
      data: { status },
    });
  },

  /**
   * Convert lead to business
   */
  convertToBusiness: async (
    leadId: string,
    businessId: string
  ): Promise<Lead> => {
    return prisma.lead.update({
      where: { id: leadId },
      data: {
        businessId,
        status: LeadStatus.ferdig,
      },
    });
  },
};
