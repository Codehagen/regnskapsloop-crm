import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { CustomerStage } from "@/app/generated/prisma";

// Schema for updating lead stage
const updateStageSchema = z.object({
  stage: z.enum([
    CustomerStage.lead,
    CustomerStage.prospect,
    CustomerStage.qualified,
    CustomerStage.customer,
    CustomerStage.churned,
  ]),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const lead = await prisma.business.findUnique({
      where: { id },
      include: {
        contacts: true,
        activities: {
          orderBy: {
            date: "desc",
          },
        },
        offers: true,
        tags: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching lead data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// For updating a lead's stage via API
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Validate the input
    const validationResult = updateStageSchema.safeParse(body);
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

    const { stage, notes } = validationResult.data;

    // Check if the lead exists
    const existingLead = await prisma.business.findUnique({
      where: { id },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    // Update the lead's stage
    const updatedLead = await prisma.business.update({
      where: { id },
      data: {
        stage,
        // Append notes if provided
        notes: notes
          ? `${existingLead.notes ? existingLead.notes + "\n\n" : ""}${notes}`
          : existingLead.notes,
      },
    });

    // Log the status change as an activity
    await prisma.activity.create({
      data: {
        type: "note",
        date: new Date(),
        description: `Status endret fra ${existingLead.stage} til ${stage}`,
        businessId: id,
        completed: true,
        userId: "system", // Use a system user ID
        ...(notes && { outcome: notes }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lead stage updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Error updating lead stage:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating lead stage",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// For deleting a lead via API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if the lead exists
    const existingLead = await prisma.business.findUnique({
      where: { id },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    // Delete the lead
    await prisma.business.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting lead",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
