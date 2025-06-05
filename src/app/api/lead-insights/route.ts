import { openai } from "@ai-sdk/openai"; // Assuming you are using OpenAI
import { generateObject, NoObjectGeneratedError } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds (adjust as needed)
export const maxDuration = 30;

// Define the structure we expect the AI to return
const leadInsightSchema = z.object({
  summary: z
    .string()
    .describe("A concise summary of the lead based on the provided data."),
  recommendations: z
    .array(z.string())
    .describe("3-5 actionable next steps or recommendations for this lead."),
  enrichment: z
    .object({
      potentialLinkedIn: z
        .string()
        .optional()
        .nullable()
        .describe("A potential LinkedIn profile URL if identifiable."),
      potentialWebsite: z
        .string()
        .optional()
        .nullable()
        .describe("A potential company website URL if identifiable."),
      keyInfo: z
        .string()
        .optional()
        .nullable()
        .describe(
          "Any other key information inferred or found from public sources (e.g., industry, size)."
        ),
    })
    .describe("Information potentially enriched from public sources."),
});

export async function POST(req: Request) {
  try {
    // TODO: Add authentication/authorization checks here
    // Ensure the user is logged in and has permission

    const { lead } = await req.json();

    // Basic validation: Check if lead data is provided
    if (!lead || typeof lead !== "object") {
      return Response.json({ error: "Invalid lead data" }, { status: 400 });
    }

    // TODO: Consider filtering/selecting specific lead fields to send to the AI
    // to reduce token usage and focus the prompt.
    const leadDataForPrompt = JSON.stringify(lead, null, 2);

    const prompt = `
      Analyser følgende lead-data for et CRM-system:
      \`\`\`json
      ${leadDataForPrompt}
      \`\`\`

      VIKTIG: Svaret MÅ være på NORSK.

      Gi følgende innsikt:
      1.  **Oppsummering:** En kort oversikt over leadets nåværende status, potensielle verdi og nøkkelkarakteristikker.
      2.  **Anbefalinger:** Foreslå 3-5 konkrete neste handlinger (f.eks. 'Planlegg oppfølgingssamtale', 'Send relevant casestudie', 'Kvalifiser budsjett').
      3.  **Anrikning:** Basert *kun* på oppgitt navn, e-post, firmanavn og nettsted (hvis tilgjengelig), prøv å finne en potensiell LinkedIn-profil URL, en firmaside URL (hvis ikke allerede oppgitt), og annen nøkkelinformasjon fra offentlige kilder (som bransje eller firmastørrelse hvis lett identifiserbart). Hvis du ikke finner pålitelig info, la anrikningsfeltene stå tomme eller som null.

      Svar KUN i det påkrevde JSON-formatet. Ikke inkluder noen forklaringer eller kommentarer utenfor JSON-strukturen.
    `;

    const { object } = await generateObject({
      // Make sure OPENAI_API_KEY is set in your environment variables
      model: openai(process.env.OPENAI_MODEL || "gpt-4o"), // Use gpt-4o or your preferred model
      schema: leadInsightSchema,
      prompt: prompt,
      temperature: 0.3, // Lower temperature for more deterministic results
    });

    return Response.json(object);
  } catch (error) {
    console.error("[LEAD INSIGHTS API ERROR]:", error);

    if (NoObjectGeneratedError.isInstance(error)) {
      // Log specific details if the AI failed to generate the object
      console.error("AI failed to generate object:", {
        cause: error.cause,
        text: error.text,
        response: error.response,
        usage: error.usage,
      });
      return Response.json(
        { error: "AI failed to generate insights. Please try again." },
        { status: 500 }
      );
    } else if (error instanceof Error) {
      // Handle generic errors
      return Response.json({ error: error.message }, { status: 500 });
    } else {
      // Handle unknown errors
      return Response.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
