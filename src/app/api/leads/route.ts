import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { BusinessStatus, CustomerStage } from "@/app/generated/prisma";
import { fetchBrregData, mergeBrregData } from "@/lib/brreg"; // Import Brreg functions

// Define validation schema for incoming lead data
const leadSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  email: z.string().email("Gyldig e-post er påkrevd"),
  phone: z.string().min(1, "Telefonnummer er påkrevd"),
  orgNumber: z.string().optional(),
  contactPerson: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
  potensiellVerdi: z.number().optional(),
  sourceSystem: z.string().optional(), // Which system sent the lead
  externalId: z.string().optional(), // External system's ID for the lead
});

// Utility to log requests for debugging
const logRequest = (req: NextRequest, data: any) => {
  console.log(`[${new Date().toISOString()}] Lead API Request:`, {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    data: data,
  });
};

export async function POST(req: NextRequest) {
  try {
    // Extract API Key from header
    const apiKey = req.headers.get("X-API-Key");

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "API key is missing" },
        { status: 401 }
      );
    }

    // Validate API Key and find workspace
    const workspace = await prisma.workspace.findFirst({
      where: { apiKey: apiKey },
    });

    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Invalid API key" },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await req.json();
    logRequest(req, body);

    // Validate the incoming data
    const validationResult = leadSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create a new lead
    const lead = await prisma.business.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        orgNumber: data.orgNumber,
        contactPerson: data.contactPerson,
        website: data.website,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        country: data.country,
        industry: data.industry,
        notes: data.notes,
        potensiellVerdi: data.potensiellVerdi,
        status: BusinessStatus.active,
        stage: CustomerStage.lead,
        workspaceId: workspace.id, // Associate with the workspace
      },
    });

    // --- Start Brreg Enrichment ---
    let updatedLeadData = { ...lead }; // Keep track of the latest data

    if (lead.orgNumber) {
      console.log(
        `Attempting Brreg enrichment for lead ${lead.id} (org: ${lead.orgNumber})`
      );
      try {
        const brregData = await fetchBrregData(lead.orgNumber);
        if (brregData) {
          const updateData = mergeBrregData(lead, brregData);
          const updateKeys = Object.keys(updateData);

          // Only update if there are changes beyond the timestamp
          if (
            updateKeys.length > 1 ||
            (updateKeys.length === 1 && updateKeys[0] !== "brregUpdatedAt")
          ) {
            console.log(
              `Updating lead ${lead.id} with Brreg data:`,
              updateData
            );
            const updatedLead = await prisma.business.update({
              where: { id: lead.id },
              data: updateData,
            });
            updatedLeadData = { ...updatedLead }; // Use the updated data
          } else {
            console.log(
              `No new data from Brreg to update for lead ${lead.id}.`
            );
            // Still update the timestamp to indicate a check was performed
            await prisma.business.update({
              where: { id: lead.id },
              data: { brregUpdatedAt: new Date() },
            });
          }
        } else {
          console.log(
            `No Brreg data found or parsed for org number: ${lead.orgNumber}`
          );
        }
      } catch (enrichmentError) {
        // Log the enrichment error but don't fail the main request
        console.error(
          `Error during Brreg enrichment for lead ${lead.id}:`,
          enrichmentError
        );
      }
    }
    // --- End Brreg Enrichment ---

    // Log the source of this lead if provided
    if (data.sourceSystem) {
      await prisma.activity.create({
        data: {
          type: "note",
          date: new Date(),
          description: `Lead opprettet fra ${data.sourceSystem}${
            data.externalId ? ` (ID: ${data.externalId})` : ""
          }`,
          businessId: lead.id,
          completed: true,
          // userId: "system", // Decide if you want a system user or link to the workspace/API key owner
          workspaceId: workspace.id, // Associate activity with the workspace
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Lead created successfully",
      data: {
        id: updatedLeadData.id, // Return the potentially updated lead ID
        externalId: data.externalId,
        isNew: true,
      },
    });
  } catch (error) {
    console.error("Error processing lead API request:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred processing the request",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optionally add a GET handler to verify the API is working
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Lead API is running",
  });
}
