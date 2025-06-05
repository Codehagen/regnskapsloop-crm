import { prisma } from "@/lib/db";
import {
  Business,
  BusinessStatus,
  CustomerStage,
  Contact,
  Activity,
  Offer,
} from "@/app/generated/prisma";

export interface CreateBusinessInput {
  name: string;
  orgNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  contactPerson?: string;
  email: string;
  phone: string;
  website?: string;
  industry?: string;
  numberOfEmployees?: number;
  revenue?: number;
  notes?: string;
  status: BusinessStatus;
  stage: CustomerStage;
  potensiellVerdi?: number;
  tags?: string[];
}

export interface UpdateBusinessInput {
  name?: string;
  orgNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string | null;
  industry?: string | null;
  numberOfEmployees?: number | null;
  revenue?: number | null;
  notes?: string | null;
  status?: BusinessStatus;
  stage?: CustomerStage;
  bilagCount?: number;
  potensiellVerdi?: number | null;
}

// Business with related data
export interface BusinessWithRelations extends Business {
  contacts: Contact[];
  activities: Activity[];
  offers: Offer[];
  tags: { name: string }[];
}

export const businessService = {
  /**
   * Get all businesses
   */
  getAllBusinesses: async (): Promise<Business[]> => {
    return prisma.business.findMany({
      orderBy: {
        name: "asc",
      },
    });
  },

  /**
   * Get businesses by stage
   */
  getBusinessesByStage: async (stage: CustomerStage): Promise<Business[]> => {
    return prisma.business.findMany({
      where: { stage },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Get leads (businesses at early stages: lead, prospect, qualified)
   */
  getLeads: async (): Promise<Business[]> => {
    return prisma.business.findMany({
      where: {
        stage: {
          in: [
            CustomerStage.lead,
            CustomerStage.prospect,
            CustomerStage.qualified,
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Get a business by ID with all related data
   */
  getBusinessById: async (
    id: string
  ): Promise<BusinessWithRelations | null> => {
    return prisma.business.findUnique({
      where: { id },
      include: {
        contacts: true,
        activities: {
          orderBy: {
            date: "desc",
          },
        },
        offers: {
          include: {
            items: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        tags: true,
      },
    });
  },

  /**
   * Create a new business
   */
  createBusiness: async (
    businessData: CreateBusinessInput
  ): Promise<Business> => {
    const { tags, ...rest } = businessData;

    const tagsData = tags
      ? {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        }
      : undefined;

    return prisma.business.create({
      data: {
        ...rest,
        // Connect or create tags
        tags: tagsData,
      },
    });
  },

  /**
   * Update a business
   */
  updateBusiness: async (
    id: string,
    data: UpdateBusinessInput
  ): Promise<Business> => {
    return prisma.business.update({
      where: { id },
      data,
    });
  },

  /**
   * Update business stage - used for lifecycle changes (e.g., lead to customer)
   */
  updateBusinessStage: async (
    id: string,
    stage: CustomerStage
  ): Promise<Business> => {
    return prisma.business.update({
      where: { id },
      data: { stage },
    });
  },

  /**
   * Delete a business
   */
  deleteBusiness: async (id: string): Promise<Business> => {
    return prisma.business.delete({
      where: { id },
    });
  },

  /**
   * Add tags to a business
   */
  addTagsToBusiness: async (
    businessId: string,
    tagNames: string[]
  ): Promise<Business> => {
    return prisma.business.update({
      where: { id: businessId },
      data: {
        tags: {
          connectOrCreate: tagNames.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });
  },

  /**
   * Remove a tag from a business
   */
  removeTagFromBusiness: async (
    businessId: string,
    tagName: string
  ): Promise<Business> => {
    const tag = await prisma.tag.findUnique({
      where: { name: tagName },
    });

    if (!tag) {
      throw new Error(`Tag ${tagName} not found`);
    }

    return prisma.business.update({
      where: { id: businessId },
      data: {
        tags: {
          disconnect: { id: tag.id },
        },
      },
    });
  },

  /**
   * Get all contacts for a business
   */
  getBusinessContacts: async (businessId: string): Promise<Contact[]> => {
    return prisma.contact.findMany({
      where: { businessId },
      orderBy: { isPrimary: "desc" },
    });
  },

  /**
   * Get all activities for a business
   */
  getBusinessActivities: async (businessId: string): Promise<Activity[]> => {
    return prisma.activity.findMany({
      where: { businessId },
      orderBy: { date: "desc" },
      include: {
        contact: true,
      },
    });
  },

  /**
   * Get all offers for a business
   */
  getBusinessOffers: async (businessId: string): Promise<Offer[]> => {
    return prisma.offer.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        contact: true,
      },
    });
  },
};
