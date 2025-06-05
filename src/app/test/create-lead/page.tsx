import { prisma } from "@/lib/db";
import CreateLeadForm from "./CreateLeadForm";

export default async function CreateLeadTestPage() {
  // Fetch workspaces and their API keys to populate the dropdown
  const workspaces = await prisma.workspace.findMany({
    select: {
      id: true,
      name: true,
      apiKey: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Filter out workspaces without API keys just in case
  const workspacesWithKeys = workspaces.filter((ws) => ws.apiKey);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Lead Creation API</h1>
      <p className="mb-4 text-gray-600">
        Use this form to send test data to the <code>POST /api/leads</code>{" "}
        endpoint. The API Key for the selected workspace will be used
        automatically.
      </p>
      <CreateLeadForm workspaces={workspacesWithKeys} />
    </div>
  );
}
