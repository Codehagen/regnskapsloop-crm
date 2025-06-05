"use client";

import { useState, FormEvent } from "react";

interface Workspace {
  id: string;
  name: string;
  apiKey: string;
}

interface CreateLeadFormProps {
  workspaces: Workspace[];
}

export default function CreateLeadForm({ workspaces }: CreateLeadFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [orgNumber, setOrgNumber] = useState("");
  const [contactPerson, setContactPerson] = useState(""); // Mapped to contactPerson
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(
    workspaces[0]?.id || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponseMessage(null);
    setIsError(false);

    const selectedWorkspace = workspaces.find(
      (ws) => ws.id === selectedWorkspaceId
    );

    if (!selectedWorkspace || !selectedWorkspace.apiKey) {
      setResponseMessage(
        "Error: Could not find API Key for selected workspace."
      );
      setIsError(true);
      setIsLoading(false);
      return;
    }

    const currentApiKey = selectedWorkspace.apiKey;

    const payload = {
      name: businessName, // Business name
      email,
      phone,
      orgNumber: orgNumber || undefined, // Send undefined if empty
      contactPerson: contactPerson || undefined, // Send undefined if empty
      // Add other optional fields from your schema here if needed for testing
      // website, address, postalCode, city, country, industry, notes, potensiellVerdi
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": currentApiKey,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setResponseMessage(
          `Success! Lead created with ID: ${result.data.id}. Check console/DB for enrichment details.`
        );
        setIsError(false);
        // Clear form on success?
        // setBusinessName(''); setOrgNumber(''); ...
      } else {
        setResponseMessage(
          `Error: ${result.message || "Unknown error"} ${
            result.errors ? JSON.stringify(result.errors) : ""
          }`
        );
        setIsError(true);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setResponseMessage(
        `Client-side error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label
          htmlFor="workspace"
          className="block text-sm font-medium text-gray-700"
        >
          Workspace
        </label>
        <select
          id="workspace"
          value={selectedWorkspaceId}
          onChange={(e) => setSelectedWorkspaceId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
        {workspaces.length === 0 && (
          <p className="mt-1 text-sm text-red-600">
            No workspaces with API keys found.
          </p>
        )}
      </div>

      <hr />

      <div>
        <label
          htmlFor="businessName"
          className="block text-sm font-medium text-gray-700"
        >
          Business Name *
        </label>
        <input
          type="text"
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="orgNumber"
          className="block text-sm font-medium text-gray-700"
        >
          Organization Number (for Brreg Enrichment)
        </label>
        <input
          type="text"
          id="orgNumber"
          value={orgNumber}
          onChange={(e) => setOrgNumber(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., 987654321"
        />
      </div>

      <div>
        <label
          htmlFor="contactPerson"
          className="block text-sm font-medium text-gray-700"
        >
          Contact Person Name
        </label>
        <input
          type="text"
          id="contactPerson"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Ola Nordmann"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
          placeholder="ola.nordmann@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
          placeholder="12345678"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || workspaces.length === 0}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? "Submitting..." : "Create Lead"}
      </button>

      {responseMessage && (
        <div
          className={`mt-4 p-3 rounded-md ${
            isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {responseMessage}
        </div>
      )}
    </form>
  );
}
