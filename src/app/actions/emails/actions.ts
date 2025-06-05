"use server";

import { prisma } from "@/lib/db";
import { Email } from "@/app/generated/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { simpleParser } from "mailparser";

// Get all emails for a specific business/lead within a workspace
export async function getBusinessEmails(
  businessId: string,
  workspaceId: string
): Promise<Email[]> {
  if (!businessId || !workspaceId) {
    throw new Error("Business ID and Workspace ID are required");
  }
  try {
    return await prisma.email.findMany({
      where: {
        businessId: businessId,
        workspaceId: workspaceId,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error(
      `Error fetching emails for business ${businessId} in workspace ${workspaceId}:`,
      error
    );
    throw new Error("Failed to fetch emails");
  }
}

// Get a specific email by ID within a workspace
export async function getEmailById(
  emailId: string,
  workspaceId: string
): Promise<Email | null> {
  if (!emailId || !workspaceId) {
    throw new Error("Email ID and Workspace ID are required");
  }
  try {
    return await prisma.email.findUnique({
      where: {
        id: emailId,
        workspaceId: workspaceId,
      },
    });
  } catch (error) {
    console.error(
      `Error fetching email ${emailId} in workspace ${workspaceId}:`,
      error
    );
    throw new Error("Failed to fetch email");
  }
}

// Define the schema for creating an email
const createEmailSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  senderEmail: z.string().email("Invalid sender email"),
  senderName: z.string().optional(),
  recipientEmail: z.string().email("Invalid recipient email"),
  recipientName: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  htmlContent: z.string().optional(),
  receivedAt: z.date().optional(),
  attachments: z.any().optional(), // JSON field
  messageId: z.string().optional(),
  inReplyTo: z.string().optional(),
  priority: z.string().optional(),
  businessId: z.string().optional(),
  contactId: z.string().optional(),
  workspaceId: z.string().min(1, "Workspace ID is required"),
});

// Create a new email
export async function createEmail(
  values: z.infer<typeof createEmailSchema>
): Promise<{
  success: boolean;
  message: string;
  data?: Email;
  error?: any;
}> {
  const validatedFields = createEmailSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error(
      "Email validation failed:",
      validatedFields.error.flatten().fieldErrors
    );
    return {
      success: false,
      message: "Validation failed",
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const emailData = validatedFields.data;

    // Verify the business exists in the workspace if businessId is provided
    if (emailData.businessId) {
      const business = await prisma.business.findUnique({
        where: {
          id: emailData.businessId,
          workspaceId: emailData.workspaceId,
        },
        select: { id: true },
      });

      if (!business) {
        return {
          success: false,
          message: "Business not found in workspace",
        };
      }
    }

    const newEmail = await prisma.email.create({
      data: {
        ...emailData,
        // Handle optional fields
        senderName: emailData.senderName || undefined,
        recipientName: emailData.recipientName || undefined,
        htmlContent: emailData.htmlContent || undefined,
        receivedAt: emailData.receivedAt || undefined,
        attachments: emailData.attachments || undefined,
        messageId: emailData.messageId || undefined,
        inReplyTo: emailData.inReplyTo || undefined,
        priority: emailData.priority || "Normal",
        businessId: emailData.businessId || undefined,
        contactId: emailData.contactId || undefined,
      },
    });

    // Revalidate relevant paths
    if (emailData.businessId) {
      revalidatePath(`/leads/${emailData.businessId}`);
    }
    revalidatePath("/leads");

    return {
      success: true,
      message: "Email created successfully",
      data: newEmail,
    };
  } catch (error) {
    console.error("Error creating email:", error);
    return {
      success: false,
      message: "Failed to create email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update email importance flag
export async function updateEmailImportance(
  emailId: string,
  isImportant: boolean,
  workspaceId: string
): Promise<{
  success: boolean;
  message: string;
  data?: Email;
  error?: any;
}> {
  if (!emailId || !workspaceId) {
    return {
      success: false,
      message: "Email ID and Workspace ID are required",
    };
  }

  try {
    // Verify the email exists in the workspace
    const existingEmail = await prisma.email.findUnique({
      where: {
        id: emailId,
        workspaceId: workspaceId,
      },
      select: { id: true, businessId: true },
    });

    if (!existingEmail) {
      return {
        success: false,
        message: "Email not found in workspace",
      };
    }

    const updatedEmail = await prisma.email.update({
      where: {
        id: emailId,
      },
      data: {
        isImportant: isImportant,
      },
    });

    // Revalidate relevant paths
    if (existingEmail.businessId) {
      revalidatePath(`/leads/${existingEmail.businessId}`);
    }
    revalidatePath("/leads");

    return {
      success: true,
      message: `Email marked as ${isImportant ? "important" : "normal"}`,
      data: updatedEmail,
    };
  } catch (error) {
    console.error("Error updating email importance:", error);
    return {
      success: false,
      message: "Failed to update email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Mark email as read/unread
export async function updateEmailReadStatus(
  emailId: string,
  isRead: boolean,
  workspaceId: string
): Promise<{
  success: boolean;
  message: string;
  data?: Email;
  error?: any;
}> {
  if (!emailId || !workspaceId) {
    return {
      success: false,
      message: "Email ID and Workspace ID are required",
    };
  }

  try {
    // Verify the email exists in the workspace
    const existingEmail = await prisma.email.findUnique({
      where: {
        id: emailId,
        workspaceId: workspaceId,
      },
      select: { id: true, businessId: true },
    });

    if (!existingEmail) {
      return {
        success: false,
        message: "Email not found in workspace",
      };
    }

    const updatedEmail = await prisma.email.update({
      where: {
        id: emailId,
      },
      data: {
        isRead: isRead,
      },
    });

    // Revalidate relevant paths
    if (existingEmail.businessId) {
      revalidatePath(`/leads/${existingEmail.businessId}`);
    }
    revalidatePath("/leads");

    return {
      success: true,
      message: `Email marked as ${isRead ? "read" : "unread"}`,
      data: updatedEmail,
    };
  } catch (error) {
    console.error("Error updating email read status:", error);
    return {
      success: false,
      message: "Failed to update email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Delete an email
export async function deleteEmail(
  emailId: string,
  workspaceId: string
): Promise<{
  success: boolean;
  message: string;
  error?: any;
}> {
  if (!emailId || !workspaceId) {
    return {
      success: false,
      message: "Email ID and Workspace ID are required",
    };
  }

  try {
    // Verify the email exists in the workspace
    const existingEmail = await prisma.email.findUnique({
      where: {
        id: emailId,
        workspaceId: workspaceId,
      },
      select: { id: true, businessId: true },
    });

    if (!existingEmail) {
      return {
        success: false,
        message: "Email not found in workspace",
      };
    }

    await prisma.email.delete({
      where: {
        id: emailId,
      },
    });

    // Revalidate relevant paths
    if (existingEmail.businessId) {
      revalidatePath(`/leads/${existingEmail.businessId}`);
    }
    revalidatePath("/leads");

    return {
      success: true,
      message: "Email deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting email:", error);
    return {
      success: false,
      message: "Failed to delete email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Parse and create email from uploaded file
export async function parseAndCreateEmail(
  fileBase64: string,
  filename: string,
  businessId: string,
  workspaceId: string,
  leadEmail: string,
  leadName: string
): Promise<{
  success: boolean;
  message: string;
  data?: Email;
  error?: any;
}> {
  try {
    // Convert base64 back to buffer for mailparser
    const fileBuffer = Buffer.from(fileBase64, "base64");
    console.log(
      `Server: Processing email file: ${filename}, size: ${fileBuffer.length}`
    );

    // Parse email with mailparser (server-side)
    let parsed;
    try {
      parsed = await simpleParser(fileBuffer);
      console.log("Server: Email parsed successfully with mailparser:", {
        subject: parsed.subject,
        from: parsed.from,
        to: parsed.to,
        date: parsed.date,
        hasHtml: !!parsed.html,
        hasText: !!parsed.text,
        attachmentCount: parsed.attachments?.length || 0,
      });
    } catch (parseError) {
      console.error("Server: Mailparser failed:", parseError);
      return {
        success: false,
        message: `Email parsing failed: ${
          parseError instanceof Error
            ? parseError.message
            : "Unknown parsing error"
        }`,
      };
    }

    // Extract email data using mailparser
    let parsedEmail;
    try {
      parsedEmail = parseEmailWithMailparser(
        parsed,
        filename,
        leadEmail,
        leadName
      );
      console.log("Server: Email data extracted:", {
        subject: parsedEmail.subject,
        senderEmail: parsedEmail.senderEmail,
        contentLength: parsedEmail.content?.length || 0,
        hasHtml: !!parsedEmail.htmlContent,
      });
    } catch (extractError) {
      console.error("Server: Email data extraction failed:", extractError);
      return {
        success: false,
        message: `Email data extraction failed: ${
          extractError instanceof Error
            ? extractError.message
            : "Unknown extraction error"
        }`,
      };
    }

    // Validate required fields before saving
    if (
      !parsedEmail.subject ||
      !parsedEmail.senderEmail ||
      !parsedEmail.content
    ) {
      console.error("Server: Missing required fields:", {
        subject: !!parsedEmail.subject,
        senderEmail: !!parsedEmail.senderEmail,
        content: !!parsedEmail.content,
      });
      return {
        success: false,
        message:
          "Required email fields are missing (subject, sender, or content)",
      };
    }

    // Verify the business exists in the workspace
    const business = await prisma.business.findUnique({
      where: {
        id: businessId,
        workspaceId: workspaceId,
      },
      select: { id: true },
    });

    if (!business) {
      return {
        success: false,
        message: "Business not found in workspace",
      };
    }

    // Save to database
    console.log("Server: Attempting to save email to database...");
    const newEmail = await prisma.email.create({
      data: {
        ...parsedEmail,
        businessId,
        workspaceId,
        // Handle optional fields
        senderName: parsedEmail.senderName || undefined,
        recipientName: parsedEmail.recipientName || undefined,
        htmlContent: parsedEmail.htmlContent || undefined,
        receivedAt: parsedEmail.receivedAt || undefined,
        attachments: parsedEmail.attachments || undefined,
        messageId: parsedEmail.messageId || undefined,
        inReplyTo: parsedEmail.inReplyTo || undefined,
        priority: parsedEmail.priority || "Normal",
      },
    });

    // Revalidate relevant paths
    revalidatePath(`/leads/${businessId}`);
    revalidatePath("/leads");

    console.log("Server: Email saved successfully:", newEmail.id);
    return {
      success: true,
      message: "Email created successfully",
      data: newEmail,
    };
  } catch (error) {
    console.error("Server: Error processing email file:", error);
    return {
      success: false,
      message: "Failed to process email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Server-side email parser using mailparser
function parseEmailWithMailparser(
  parsed: any,
  filename: string,
  leadEmail: string,
  leadName: string
) {
  try {
    console.log("Server: Parsing email data from mailparser result...");

    // Extract basic information with fallbacks
    const subject =
      parsed.subject ||
      filename.replace(/\.(eml|msg|txt|html|htm|mbox)$/, "") ||
      "No Subject";

    // Handle sender information more robustly
    let senderEmail = "";
    let senderName = "";

    if (parsed.from) {
      if (
        parsed.from.value &&
        Array.isArray(parsed.from.value) &&
        parsed.from.value.length > 0
      ) {
        senderEmail = parsed.from.value[0].address || "";
        senderName = parsed.from.value[0].name || "";
      } else if (parsed.from.text) {
        senderEmail = parsed.from.text;
      } else if (typeof parsed.from === "string") {
        senderEmail = parsed.from;
      }
    }

    // Fallback if no sender found
    if (!senderEmail) {
      console.warn("Server: No sender email found, using placeholder");
      senderEmail = "unknown@unknown.com";
    }

    // Handle recipient - could be to, cc, or bcc with better error handling
    let recipientEmail = leadEmail;
    let recipientName = leadName;

    if (parsed.to) {
      if (
        parsed.to.value &&
        Array.isArray(parsed.to.value) &&
        parsed.to.value.length > 0
      ) {
        recipientEmail = parsed.to.value[0].address || recipientEmail;
        recipientName = parsed.to.value[0].name || recipientName;
      } else if (parsed.to.text) {
        recipientEmail = parsed.to.text;
      }
    }

    // Get content - prefer text content, fallback to HTML or empty
    let textContent = "";
    if (parsed.text) {
      textContent = parsed.text;
    } else if (parsed.textAsHtml) {
      textContent = parsed.textAsHtml;
    } else if (parsed.html) {
      // Strip HTML tags for text content as fallback
      textContent = parsed.html.replace(/<[^>]*>/g, "").trim();
    } else {
      textContent = `Email content from ${filename}`;
    }

    // Get HTML content
    const htmlContent = parsed.html || undefined;

    // Handle date with fallback
    let receivedAt = new Date();
    if (parsed.date) {
      const parsedDate = new Date(parsed.date);
      if (!isNaN(parsedDate.getTime())) {
        receivedAt = parsedDate;
      }
    }

    // Process attachments with error handling
    let attachments = undefined;
    if (
      parsed.attachments &&
      Array.isArray(parsed.attachments) &&
      parsed.attachments.length > 0
    ) {
      try {
        attachments = parsed.attachments.map((att: any, index: number) => ({
          filename: att.filename || `attachment_${index + 1}`,
          contentType: att.contentType || "application/octet-stream",
          size: att.size || 0,
          contentId: att.contentId || undefined,
          // TODO: For future Cloudflare R2 integration:
          // 1. Upload att.content (Buffer) to Cloudflare R2 bucket
          // 2. Store the R2 URL here instead of just metadata
          // 3. Use Cloudflare R2 API: https://developers.cloudflare.com/r2/api/
          // Example:
          // r2Url: await uploadToR2(att.content, att.filename, workspaceId),
          // r2Key: `emails/${workspaceId}/${emailId}/${att.filename}`
        }));

        console.log(`Server: Processed ${attachments.length} attachments`);
      } catch (attachmentError) {
        console.warn("Server: Error processing attachments:", attachmentError);
        attachments = undefined; // Continue without attachments if processing fails
      }
    }

    const result = {
      subject,
      senderEmail,
      senderName: senderName || undefined,
      recipientEmail,
      recipientName: recipientName || undefined,
      content: textContent,
      htmlContent,
      receivedAt,
      attachments,
      messageId: parsed.messageId || undefined,
      inReplyTo: parsed.inReplyTo || undefined,
      priority: parsed.priority || "Normal",
    };

    console.log("Server: Email parsing completed successfully");
    return result;
  } catch (error) {
    console.error("Server: Error in parseEmailWithMailparser:", error);
    throw new Error(
      `Email parsing failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
