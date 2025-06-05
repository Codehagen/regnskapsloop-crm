import { prisma } from "@/lib/db";
import { Contact } from "@/app/generated/prisma";

export interface CreateContactInput {
  name: string;
  email: string;
  phone: string;
  position?: string;
  isPrimary: boolean;
  notes?: string;
  businessId: string;
}

export interface UpdateContactInput {
  name?: string;
  email?: string;
  phone?: string;
  position?: string | null;
  isPrimary?: boolean;
  notes?: string | null;
}

export const contactService = {
  /**
   * Get all contacts
   */
  getAllContacts: async (): Promise<Contact[]> => {
    return prisma.contact.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  /**
   * Get a contact by ID
   */
  getContactById: async (id: string): Promise<Contact | null> => {
    return prisma.contact.findUnique({
      where: { id },
      include: {
        business: true,
        activities: {
          orderBy: {
            date: "desc",
          },
        },
        offers: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  },

  /**
   * Create a new contact
   */
  createContact: async (data: CreateContactInput): Promise<Contact> => {
    // If this is set as primary, unset other primary contacts for this business
    if (data.isPrimary) {
      await prisma.contact.updateMany({
        where: {
          businessId: data.businessId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return prisma.contact.create({
      data,
    });
  },

  /**
   * Update a contact
   */
  updateContact: async (
    id: string,
    data: UpdateContactInput
  ): Promise<Contact> => {
    const contact = await prisma.contact.findUnique({
      where: { id },
      select: { businessId: true },
    });

    if (!contact) {
      throw new Error("Contact not found");
    }

    // If this is set as primary, unset other primary contacts for this business
    if (data.isPrimary) {
      await prisma.contact.updateMany({
        where: {
          businessId: contact.businessId,
          id: { not: id },
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return prisma.contact.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a contact
   */
  deleteContact: async (id: string): Promise<Contact> => {
    return prisma.contact.delete({
      where: { id },
    });
  },

  /**
   * Get all contacts for a business
   */
  getContactsByBusiness: async (businessId: string): Promise<Contact[]> => {
    return prisma.contact.findMany({
      where: { businessId },
      orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    });
  },

  /**
   * Set a contact as primary for a business
   */
  setAsPrimary: async (id: string): Promise<Contact> => {
    const contact = await prisma.contact.findUnique({
      where: { id },
      select: { businessId: true },
    });

    if (!contact) {
      throw new Error("Contact not found");
    }

    // Unset all other primary contacts for this business
    await prisma.contact.updateMany({
      where: {
        businessId: contact.businessId,
        id: { not: id },
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });

    // Set this contact as primary
    return prisma.contact.update({
      where: { id },
      data: {
        isPrimary: true,
      },
    });
  },
};
