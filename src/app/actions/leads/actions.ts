"use server";

import { prisma } from "@/lib/db";
import {
  Business,
  CustomerStage,
  Activity,
  ActivityType,
} from "@/app/generated/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fetchBrregData, mergeBrregData } from "@/lib/brreg"; // Import Brreg functions
import { searchBrregByName, BrregSearchItem } from "@/lib/brreg"; // Import the new search function

// Get leads (businesses in lead, prospect, qualified stages) for a specific workspace
export async function getLeads(workspaceId: string): Promise<Business[]> {
  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }
  try {
    return await prisma.business.findMany({
      where: {
        workspaceId: workspaceId,
        // Remove the explicit stage filter to include all stages
        // stage: {
        //   in: [
        //     CustomerStage.lead,
        //     CustomerStage.prospect,
        //     CustomerStage.qualified,
        //   ],
        // },
      },
      orderBy: { createdAt: "desc" }, // Consider if another order makes more sense (e.g., updatedAt)
    });
  } catch (error) {
    console.error(`Error fetching leads for workspace ${workspaceId}:`, error);
    throw new Error("Failed to fetch leads");
  }
}

// Get a specific lead/business by ID within a specific workspace
export async function getLeadById(
  id: string,
  workspaceId: string
): Promise<Business | null> {
  if (!id || !workspaceId) {
    throw new Error("Lead ID and Workspace ID are required");
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
      `Error fetching lead ${id} for workspace ${workspaceId}:`,
      error
    );
    throw new Error("Failed to fetch lead details");
  }
}

// Update the stage of a lead/business within a specific workspace
export async function updateLeadStatus(
  leadId: string,
  newStage: CustomerStage,
  workspaceId: string
): Promise<Business> {
  if (!leadId || !workspaceId) {
    throw new Error("Lead ID and Workspace ID are required");
  }
  try {
    // First, verify the lead exists in the specified workspace
    const existingLead = await prisma.business.findUnique({
      where: {
        id: leadId,
        workspaceId: workspaceId,
      },
      select: { id: true },
    });

    if (!existingLead) {
      throw new Error(
        `Lead with ID ${leadId} not found in workspace ${workspaceId}`
      );
    }

    // If found, update the stage
    return await prisma.business.update({
      where: {
        id: leadId,
      },
      data: {
        stage: newStage,
      },
    });
  } catch (error) {
    console.error(
      `Error updating lead ${leadId} status in workspace ${workspaceId}:`,
      error
    );
    throw new Error("Failed to update lead status");
  }
}

// Define the schema for the input object
const updateLeadSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Navn er påkrevd"),
  email: z.string().email("Ugyldig e-post").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  contactPerson: z.string().optional().or(z.literal("")),
  website: z.string().url("Ugyldig URL").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  potensiellVerdi: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined
        ? null
        : parseFloat(String(val).replace(/\s/g, "").replace(",", ".")),
    z.number().nullable().optional()
  ),
});

// Modify the action to accept an object validated by the schema
export async function updateLeadDetails(
  values: z.infer<typeof updateLeadSchema>
) {
  // The input 'values' is already validated by the form using zodResolver
  // We can directly use the values after ensuring the schema matches

  // Optional: Double-check validation if needed, though resolver handles it
  const validatedFields = updateLeadSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error(
      "Server-side validation failed (should not happen if client validation works):",
      validatedFields.error.flatten().fieldErrors
    );
    return {
      success: false,
      message: "Server validering feilet", // Server validation failed
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, ...dataToUpdate } = validatedFields.data;

  try {
    // TODO: Add authorization check
    console.log(`Updating lead ${id} with data:`, dataToUpdate);

    const updatedLead = await prisma.business.update({
      where: { id: id },
      data: {
        ...dataToUpdate,
        // Handle optional fields for Prisma
        email: dataToUpdate.email || undefined,
        phone: dataToUpdate.phone || undefined,
        contactPerson: dataToUpdate.contactPerson || undefined,
        website: dataToUpdate.website || undefined,
        address: dataToUpdate.address || undefined,
        postalCode: dataToUpdate.postalCode || undefined,
        city: dataToUpdate.city || undefined,
        country: dataToUpdate.country || undefined,
        industry: dataToUpdate.industry || undefined,
        notes: dataToUpdate.notes || undefined,
        potensiellVerdi: dataToUpdate.potensiellVerdi, // Already number | null | undefined
      },
    });

    console.log(`Successfully updated lead ${id}`);

    revalidatePath(`/leads/${id}`);
    revalidatePath(`/leads`);

    return {
      success: true,
      message: "Lead oppdatert",
      data: updatedLead,
    };
  } catch (error) {
    console.error("Error updating lead details:", error);
    return {
      success: false,
      message: "Klarte ikke å oppdatere lead",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get all activities for a specific lead/business
export async function getLeadActivities(
  leadId: string,
  workspaceId: string
): Promise<{
  success: boolean;
  data?: Activity[]; // Use the Prisma Activity type
  message?: string;
  error?: any;
}> {
  if (!leadId || !workspaceId) {
    return {
      success: false,
      message: "Lead ID and Workspace ID are required",
    };
  }
  try {
    const activities = await prisma.activity.findMany({
      where: {
        businessId: leadId,
        workspaceId: workspaceId,
        // No 'type' filter, fetch all types
      },
      orderBy: {
        date: "desc", // Show newest first
      },
      include: {
        user: {
          // Include user info if needed (e.g., to display name)
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    // No revalidation needed for just fetching data
    return {
      success: true,
      data: activities,
    };
  } catch (error) {
    console.error(
      `Error fetching activities for lead ${leadId} in workspace ${workspaceId}:`,
      error
    );
    return {
      success: false,
      message: "Failed to fetch activities",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Notes (Activities) ---

// Get notes (activities of type "note") for a specific lead
export async function getLeadNotes(leadId: string, workspaceId: string) {
  if (!leadId || !workspaceId) {
    throw new Error("Lead ID and Workspace ID are required");
  }
  try {
    const notes = await prisma.activity.findMany({
      where: {
        businessId: leadId,
        workspaceId: workspaceId,
        type: "note",
      },
      orderBy: {
        date: "desc", // Show newest first
      },
      include: {
        user: {
          // Include user info if needed (e.g., to display name)
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    revalidatePath(`/leads/${leadId}`);
    return {
      success: true,
      data: notes,
    };
  } catch (error) {
    console.error(`Error fetching notes for lead ${leadId}:`, error);
    return {
      success: false,
      message: "Failed to fetch notes",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Add a note (activity) to a lead
export async function addLeadNote(formData: FormData) {
  const leadId = formData.get("leadId") as string;
  const workspaceId = formData.get("workspaceId") as string;
  const content = formData.get("content") as string;
  const clerkId = formData.get("clerkId") as string; // Changed from userId to clerkId

  // Basic validation
  if (!leadId || !workspaceId || !content || !clerkId) {
    return {
      success: false,
      message:
        "Missing required fields (leadId, workspaceId, content, clerkId)", // Updated field name
    };
  }

  try {
    // Find the internal user ID based on the Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
      select: { id: true }, // Only select the internal ID
    });

    if (!user) {
      return {
        success: false,
        message: "User not found in database",
      };
    }

    // Optional: Verify lead exists in workspace
    const leadExists = await prisma.business.count({
      where: { id: leadId, workspaceId: workspaceId },
    });
    if (leadExists === 0) {
      return { success: false, message: "Lead not found in workspace" };
    }

    const newNote = await prisma.activity.create({
      data: {
        type: "note",
        date: new Date(),
        description: content,
        businessId: leadId,
        workspaceId: workspaceId,
        userId: user.id, // Use the looked-up internal user ID
        completed: true,
      },
      // Include user details in the response if needed by the frontend
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath(`/leads/${leadId}`);

    return {
      success: true,
      message: "Note added successfully",
      data: newNote,
    };
  } catch (error) {
    console.error(`Error adding note for lead ${leadId}:`, error);
    return {
      success: false,
      message: "Failed to add note",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update a note (activity) content
export async function updateLeadNote(formData: FormData) {
  const noteId = formData.get("noteId") as string;
  const workspaceId = formData.get("workspaceId") as string;
  const content = formData.get("content") as string;
  const clerkId = formData.get("clerkId") as string; // For authorization check
  const leadId = formData.get("leadId") as string; // Optional, but good for revalidation

  // Basic validation
  if (!noteId || !workspaceId || !content?.trim() || !clerkId) {
    return {
      success: false,
      message:
        "Missing required fields (noteId, workspaceId, content, clerkId)",
    };
  }

  try {
    // TODO: Add authorization: Check if clerkId corresponds to a user
    // who has permission to update this note in this workspace.
    // Example: Fetch user, check workspace membership, potentially check note ownership.

    // Verify the note exists and belongs to the workspace before updating
    const note = await prisma.activity.findUnique({
      where: {
        id: noteId,
        workspaceId: workspaceId,
        type: "note", // Ensure it's actually a note
      },
      select: { id: true }, // Just need to know it exists
    });

    if (!note) {
      return {
        success: false,
        message: "Note not found or does not belong to this workspace.",
      };
    }

    // Update the note content
    const updatedNote = await prisma.activity.update({
      where: {
        id: noteId,
        // Including workspaceId here is redundant due to the check above but adds safety
        workspaceId: workspaceId,
      },
      data: {
        description: content,
        // Optionally update the updatedAt timestamp if your schema has it
        // updatedAt: new Date(),
      },
      // Include user details if needed, matching getLeadNotes and addLeadNote
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Revalidate the path if leadId was provided
    if (leadId) {
      revalidatePath(`/leads/${leadId}`);
    }

    return {
      success: true,
      message: "Note updated successfully",
      data: updatedNote,
    };
  } catch (error) {
    console.error(`Error updating note ${noteId}:`, error);
    return {
      success: false,
      message: "Failed to update note",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Delete a note (activity)
export async function deleteLeadNote(formData: FormData) {
  const noteId = formData.get("noteId") as string;
  const workspaceId = formData.get("workspaceId") as string;
  const leadId = formData.get("leadId") as string; // Needed for revalidation

  if (!noteId || !workspaceId || !leadId) {
    return {
      success: false,
      message: "Missing required fields (noteId, workspaceId, leadId)",
    };
  }

  try {
    // Verify the note exists in the specified workspace before deleting
    await prisma.activity.deleteMany({
      where: {
        id: noteId,
        workspaceId: workspaceId,
        type: "note", // Ensure we only delete notes
      },
    });

    revalidatePath(`/leads/${leadId}`); // Revalidate the lead detail page

    return {
      success: true,
      message: "Note deleted successfully",
    };
  } catch (error) {
    console.error(`Error deleting note ${noteId}:`, error);
    return {
      success: false,
      message: "Failed to delete note",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- General Activities ---

// Add a new activity (call, email, meeting, note) to a lead
export async function addLeadActivity(formData: FormData) {
  const leadId = formData.get("leadId") as string;
  const workspaceId = formData.get("workspaceId") as string;
  const type = formData.get("type") as ActivityType; // Get type from form
  const description = formData.get("description") as string; // Map component's "title" here
  const clerkId = formData.get("clerkId") as string;
  // Optionally get outcome/details if component passes it later
  // const outcome = formData.get("outcome") as string;

  // Basic validation
  if (!leadId || !workspaceId || !type || !description || !clerkId) {
    return {
      success: false,
      message:
        "Missing required fields (leadId, workspaceId, type, description, clerkId)",
    };
  }

  // Validate activity type against the enum
  if (!Object.values(ActivityType).includes(type)) {
    return {
      success: false,
      message: `Invalid activity type: ${type}`,
    };
  }

  try {
    // Find the internal user ID based on the Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
      select: { id: true },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found in database",
      };
    }

    // Optional: Verify lead exists in workspace
    const leadExists = await prisma.business.count({
      where: { id: leadId, workspaceId: workspaceId },
    });
    if (leadExists === 0) {
      return { success: false, message: "Lead not found in workspace" };
    }

    const newActivity = await prisma.activity.create({
      data: {
        type: type,
        date: new Date(),
        description: description, // Store component's title here
        // outcome: outcome || undefined, // Store component's description/details here if needed later
        businessId: leadId,
        workspaceId: workspaceId,
        userId: user.id, // Use the looked-up internal user ID
        completed: true, // Assuming activities are logged after completion
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath(`/leads/${leadId}`); // Revalidate the specific lead page

    return {
      success: true,
      message: "Aktivitet loggført", // "Activity logged"
      data: newActivity,
    };
  } catch (error) {
    console.error(`Error adding activity for lead ${leadId}:`, error);
    return {
      success: false,
      message: "Klarte ikke å loggføre aktivitet", // "Failed to log activity"
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Action to search for companies by name using Brreg API
export async function searchCompaniesByName(query: string): Promise<{
  success: boolean;
  data?: BrregSearchItem[];
  message?: string;
  error?: any;
}> {
  if (!query || query.trim().length < 2) {
    return {
      success: false,
      message: "Søkeord må være minst 2 tegn langt.",
    };
  }

  try {
    console.log(`Searching for companies with query: "${query}"`);

    const results = await searchBrregByName(query.trim(), 10);

    // Filter out companies that are bankrupt or winding up for better UX
    const filteredResults = results.filter(
      (company) => !company.isBankrupt && !company.isWindingUp
    );

    return {
      success: true,
      data: filteredResults,
      message: `Fant ${filteredResults.length} bedrifter.`,
    };
  } catch (error) {
    console.error(`Error searching companies by name "${query}":`, error);
    return {
      success: false,
      message: "Klarte ikke å søke etter bedrifter.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Action to create a new lead by fetching data from Brreg
export async function createLeadFromOrgNumber(
  orgNumber: string,
  workspaceId: string
): Promise<{
  success: boolean;
  message: string;
  data?: Business; // Return the created or existing business
  error?: any;
}> {
  if (!orgNumber || !workspaceId) {
    return {
      success: false,
      message: "Organisasjonsnummer og Workspace ID er påkrevd.",
    };
  }

  try {
    console.log(
      `Attempting to create lead from org number: ${orgNumber} in workspace: ${workspaceId}`
    );

    // 1. Fetch data from Brreg
    const brregData = await fetchBrregData(orgNumber);

    if (!brregData) {
      console.log(`No Brreg data found for org number: ${orgNumber}`);
      return {
        success: false,
        message: `Fant ingen data i Brønnøysundregistrene for organisasjonsnummer ${orgNumber}.`,
      };
    }

    console.log(`Brreg data found for ${orgNumber}:`, brregData);

    // 2. Check if a business with this org number already exists in the workspace
    const existingBusiness = await prisma.business.findFirst({
      where: {
        orgNumber: orgNumber,
        workspaceId: workspaceId,
      },
    });

    if (existingBusiness) {
      console.log(`Business with org number ${orgNumber} already exists.`);
      // Return success: false but include existing lead data for navigation
      return {
        success: false,
        message: `En bedrift med organisasjonsnummer ${orgNumber} finnes allerede.`,
        data: existingBusiness, // Return existing data
      };
    }

    // 3. Prepare data for Prisma create
    // Define base structure with all required fields and defaults
    const baseData: Omit<
      Business,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "contacts"
      | "activities"
      | "offers"
      | "tags"
      | "workspace"
    > = {
      orgNumber: orgNumber,
      workspaceId: workspaceId,
      status: "active",
      stage: "lead",
      name: `Ukjent Navn (${orgNumber})`, // Default name, might be overwritten by merge
      email: "", // Empty email, will be updated if Brreg provides one
      phone: "", // Default empty phone, might be overwritten
      // Initialize potentially nullable fields from the schema
      address: null,
      postalCode: null,
      city: null,
      country: null,
      contactPerson: null,
      website: null,
      industry: null,
      numberOfEmployees: null,
      revenue: null,
      notes: null,
      bilagCount: 0,
      potensiellVerdi: null,
      orgForm: null,
      industryCode: null,
      vatRegistered: null,
      establishedDate: null,
      isBankrupt: null,
      isWindingUp: null,
      brregUpdatedAt: null, // Will be set by mergeBrregData
    };

    // Merge Brreg data into the base object, potentially overwriting defaults
    // mergeBrregData now also sets brregUpdatedAt
    const mergedData = mergeBrregData(baseData, brregData);

    // Combine base and merged data, ensuring required fields are set.
    // Merged data takes precedence where it exists.
    const finalData = { ...baseData, ...mergedData };

    console.log(`Data prepared for creation:`, finalData);

    // 4. Create the new business record
    // Now finalData should better match Prisma's expected input type
    const newBusiness = await prisma.business.create({
      data: finalData,
    });

    console.log(
      `Successfully created new business ${newBusiness.id} for org number ${orgNumber}`
    );

    // 5. Revalidate paths to update UI
    revalidatePath(`/leads`);
    // Optionally revalidate specific lead page if needed, but it doesn't exist yet

    return {
      success: true,
      message: `Lead ${newBusiness.name} opprettet.`, // Use the fetched name
      data: newBusiness,
    };
  } catch (error) {
    console.error(
      `Error creating lead from org number ${orgNumber} in workspace ${workspaceId}:`,
      error
    );
    let errorMessage = "Klarte ikke å opprette lead.";
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }
    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
}
