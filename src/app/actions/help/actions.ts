"use server";

import { getUserWorkspaceData } from "@/lib/auth/workspace";

// Define the expected structure of the Slack message payload
interface SlackPayload {
  blocks: any[]; // Using 'any' for flexibility with Block Kit structure
}

export async function sendHelpRequest(
  message: string
): Promise<{ success: boolean; error?: string }> {
  // Ensure a message was provided
  if (!message || message.trim().length === 0) {
    return { success: false, error: "Meldingen kan ikke være tom." };
  }

  const slackWebhookUrl = process.env.SLACK_HELP_WEBHOOK_URL;

  if (!slackWebhookUrl) {
    console.error("SLACK_HELP_WEBHOOK_URL environment variable is not set.");
    return {
      success: false,
      error: "Konfigurasjonsfeil: Kunne ikke sende melding.",
    };
  }

  try {
    // Get user and workspace context including basic details
    const {
      userId,
      userName,
      userEmail,
      workspaceId,
      workspaceName,
    } = await getUserWorkspaceData();

    // Construct the Slack message in Norwegian using Block Kit
    const payload: SlackPayload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":sos: Ny Hjelpeforespørsel",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Fra:* ${userName ?? "Ukjent Bruker"}` },
            { type: "mrkdwn", text: `*E-post:* ${userEmail}` },
            {
              type: "mrkdwn",
              text: `*Arbeidsområde:* ${workspaceName} (${workspaceId})`,
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Melding:*\n>" + message.replace(/\n/g, "\n>"), // Indent message lines
          },
        },
      ],
    };

    // Send the request to Slack
    const response = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error(
        `Error sending message to Slack: ${response.status} ${response.statusText}`,
        responseBody
      );
      throw new Error("Kunne ikke sende meldingen til Slack.");
    }

    // Optionally revalidate paths if needed, though likely not for a help request
    // revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error processing help request:", error);
    // Provide a generic error message to the user
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "En uventet feil oppstod.",
    };
  }
}
