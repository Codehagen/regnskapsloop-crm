"use server";

import { revalidatePath } from "next/cache";
import {
  JobApplication,
  JobApplicationStatus,
  Activity,
  ActivityType,
} from "@/app/generated/prisma";
// import { jobApplicationService } from "@/lib/services"; // Remove service import
import { prisma } from "@/lib/db";

// Get all applications for a specific workspace, with optional status filtering
export async function getApplications(
  workspaceId: string,
  status?: JobApplicationStatus
) {
  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }
  try {
    const whereClause: any = { workspaceId: workspaceId };
    if (status) {
      whereClause.status = status;
    }

    const applications = await prisma.jobApplication.findMany({
      where: whereClause,
      orderBy: { applicationDate: "desc" },
    });

    return applications;
  } catch (error) {
    console.error(
      `Error fetching applications for workspace ${workspaceId} with status ${status}:`,
      error
    );
    throw new Error("Failed to fetch applications");
  }
}

// Get a single application by ID within a specific workspace, including related activities
export async function getApplicationById(id: string, workspaceId: string) {
  if (!id || !workspaceId) {
    throw new Error("Application ID and Workspace ID are required");
  }
  try {
    const application = await prisma.jobApplication.findUnique({
      where: {
        id: id,
        workspaceId: workspaceId,
      },
      include: {
        // Include activities related to this application and workspace
        activities: {
          where: {
            workspaceId: workspaceId, // Ensure activities are also from the same workspace
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!application) {
      throw new Error(
        `Application with ID ${id} not found in workspace ${workspaceId}`
      );
    }

    return application; // Already includes activities
  } catch (error) {
    console.error(
      `Error fetching application ${id} for workspace ${workspaceId}:`,
      error
    );
    throw new Error("Failed to fetch application details");
  }
}

// Update application status within a specific workspace, logging the change as an activity
export async function updateApplicationStatus(
  id: string,
  status: JobApplicationStatus,
  workspaceId: string,
  userId: string // User performing the action
) {
  if (!id || !workspaceId || !userId) {
    throw new Error("Application ID, Workspace ID, and User ID are required");
  }
  try {
    // Use transaction to ensure atomicity
    const [updatedApplication] = await prisma.$transaction([
      prisma.jobApplication.update({
        where: {
          id: id,
          workspaceId: workspaceId, // Ensure we only update if it's in the correct workspace
        },
        data: {
          status: status,
        },
      }),
      // Create an activity to log this status change
      prisma.activity.create({
        data: {
          type: "note",
          date: new Date(),
          description: `Status endret til ${getStatusLabel(status)}`,
          completed: true,
          jobApplicationId: id,
          userId: userId, // Link activity to the user who made the change
          workspaceId: workspaceId, // Link activity to the workspace
        },
      }),
    ]);

    revalidatePath(`/applications/${id}`); // Revalidate specific application page
    revalidatePath("/applications"); // Revalidate the main applications list page

    return updatedApplication;
  } catch (error) {
    console.error(
      `Error updating application ${id} status in workspace ${workspaceId}:`,
      error
    );
    // Handle potential error where application not found in workspace
    if (error instanceof Error && error.message === "P2025") {
      // Prisma error code for record not found
      throw new Error(
        `Application with ID ${id} not found in workspace ${workspaceId} or update failed.`
      );
    }
    throw new Error("Failed to update application status");
  }
}

// Helper function for status labels
function getStatusLabel(status: JobApplicationStatus): string {
  const statusLabels: Record<JobApplicationStatus, string> = {
    new: "Ny",
    reviewing: "Under vurdering",
    interviewed: "Intervjuet",
    offer_extended: "Tilbud sendt",
    hired: "Ansatt",
    rejected: "Avslått",
  };
  return statusLabels[status];
}

// Add a new activity to an application within a specific workspace
export async function addApplicationActivity(
  jobApplicationId: string,
  workspaceId: string,
  userId: string, // User adding the activity
  activityData: Omit<
    Activity,
    | "id"
    | "businessId"
    | "contactId"
    | "jobApplicationId"
    | "workspaceId" // Exclude workspaceId, it's provided separately
    | "userId" // Exclude userId, it's provided separately
    | "createdAt"
    | "updatedAt"
  >
) {
  if (!jobApplicationId || !workspaceId || !userId) {
    throw new Error("Application ID, Workspace ID, and User ID are required");
  }
  try {
    // Verify the application exists in the workspace before adding activity
    const applicationExists = await prisma.jobApplication.findUnique({
      where: { id: jobApplicationId, workspaceId: workspaceId },
      select: { id: true },
    });
    if (!applicationExists) {
      throw new Error(
        `Job application with ID ${jobApplicationId} not found in workspace ${workspaceId}`
      );
    }

    const activity = await prisma.activity.create({
      data: {
        ...activityData,
        jobApplicationId,
        userId: userId, // Link to the user creating the activity
        workspaceId: workspaceId, // Link activity to the workspace
      },
    });

    revalidatePath(`/applications/${jobApplicationId}`);

    return activity;
  } catch (error) {
    console.error(
      `Error adding activity to application ${jobApplicationId} in workspace ${workspaceId}:`,
      error
    );
    throw new Error("Failed to add activity");
  }
}

// Search applications within a specific workspace
export async function searchApplications(
  searchTerm: string,
  workspaceId: string
) {
  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }
  try {
    const applications = await prisma.jobApplication.findMany({
      where: {
        workspaceId: workspaceId,
        OR: [
          { firstName: { contains: searchTerm, mode: "insensitive" } },
          { lastName: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { desiredPosition: { contains: searchTerm, mode: "insensitive" } },
          // Add other fields to search if needed
        ],
      },
    });
    return applications;
  } catch (error) {
    console.error(
      `Error searching applications in workspace ${workspaceId} for term "${searchTerm}":`,
      error
    );
    throw new Error("Failed to search applications");
  }
}

// Add note to an application (treat as an activity)
export async function addApplicationNote(
  id: string,
  note: string,
  workspaceId: string,
  userId: string
) {
  if (!id || !note || !workspaceId || !userId) {
    throw new Error(
      "Application ID, Note, Workspace ID, and User ID are required"
    );
  }
  try {
    // Reuse addApplicationActivity to add the note
    return await addApplicationActivity(id, workspaceId, userId, {
      type: ActivityType.note, // Specify ActivityType if not already imported
      date: new Date(),
      description: note,
      completed: true, // Notes are typically considered 'completed' interactions
      outcome: null, // Or set outcome if relevant
    });
  } catch (error) {
    console.error(
      `Error adding note to application ${id} in workspace ${workspaceId}:`,
      error
    );
    throw new Error("Failed to add note");
  }
}

// Update application details within a specific workspace
export async function updateApplication(
  id: string,
  workspaceId: string,
  data: Partial<
    Omit<JobApplication, "id" | "workspaceId" | "createdAt" | "updatedAt">
  > // Exclude workspaceId from update data
) {
  if (!id || !workspaceId) {
    throw new Error("Application ID and Workspace ID are required");
  }
  try {
    const updatedApplication = await prisma.jobApplication.update({
      where: {
        id: id,
        workspaceId: workspaceId, // Ensure update happens only in the correct workspace
      },
      data: data,
    });

    revalidatePath(`/applications/${id}`);
    revalidatePath("/applications");

    return updatedApplication;
  } catch (error) {
    console.error(
      `Error updating application ${id} in workspace ${workspaceId}:`,
      error
    );
    // Handle potential error where application not found in workspace
    if (error instanceof Error && error.message === "P2025") {
      // Prisma error code for record not found
      throw new Error(
        `Application with ID ${id} not found in workspace ${workspaceId} or update failed.`
      );
    }
    throw new Error("Failed to update application");
  }
}
