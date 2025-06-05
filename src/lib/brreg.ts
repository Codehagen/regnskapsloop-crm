import { Business } from "@/app/generated/prisma";

// Simplified interface for the relevant parts of the Brreg API response
interface BrregEnhet {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform?: { kode?: string };
  forretningsadresse?: {
    adresse?: string[];
    postnummer?: string;
    poststed?: string;
    kommunenummer?: string;
    kommune?: string;
    landkode?: string;
    land?: string;
  };
  hjemmeside?: string;
  naeringskode1?: { kode?: string; beskrivelse?: string };
  antallAnsatte?: number;
  registrertIMvaregisteret?: boolean;
  stiftelsesdato?: string; // Date string 'YYYY-MM-DD'
  konkurs?: boolean;
  underAvvikling?: boolean;
  // Add other fields if needed later
}

// Interface for the cleaned/parsed data we want to use for updating our DB
export interface ParsedBrregData {
  orgNumber: string;
  name?: string;
  orgForm?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  website?: string;
  industryCode?: string;
  industry?: string;
  numberOfEmployees?: number;
  vatRegistered?: boolean;
  establishedDate?: Date;
  isBankrupt?: boolean;
  isWindingUp?: boolean;
}

// Type for the data object used to update Prisma Business model
// Explicitly include the new fields from the schema
type BusinessUpdateData = Partial<
  Omit<
    Business,
    | "id"
    | "workspaceId"
    | "createdAt"
    | "updatedAt"
    | "contacts"
    | "activities"
    | "offers"
    | "tags"
    | "workspace"
  >
>;

const BRREG_API_BASE_URL = "https://data.brreg.no/enhetsregisteret/api/enheter";

// Interface for search results from Brreg API
interface BrregSearchResult {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform?: { kode?: string; beskrivelse?: string };
  forretningsadresse?: {
    adresse?: string[];
    postnummer?: string;
    poststed?: string;
    kommunenummer?: string;
    kommune?: string;
    landkode?: string;
    land?: string;
  };
  hjemmeside?: string;
  naeringskode1?: { kode?: string; beskrivelse?: string };
  antallAnsatte?: number;
  registrertIMvaregisteret?: boolean;
  stiftelsesdato?: string;
  konkurs?: boolean;
  underAvvikling?: boolean;
}

// Interface for search response
interface BrregSearchResponse {
  _embedded?: {
    enheter: BrregSearchResult[];
  };
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

// Interface for simplified search result
export interface BrregSearchItem {
  orgNumber: string;
  name: string;
  orgForm?: string;
  address?: string;
  city?: string;
  industry?: string;
  numberOfEmployees?: number;
  isBankrupt?: boolean;
  isWindingUp?: boolean;
}

/**
 * Searches for companies by name using the Brønnøysundregisteret API.
 * Returns a list of matching companies with basic information.
 * @param query - The search query (company name)
 * @param limit - Maximum number of results to return (default: 10)
 * @returns Array of BrregSearchItem if found, otherwise empty array
 */
export async function searchBrregByName(
  query: string,
  limit: number = 10
): Promise<BrregSearchItem[]> {
  if (!query.trim()) {
    console.warn("searchBrregByName called with empty query");
    return [];
  }

  const url = `${BRREG_API_BASE_URL}?navn=${encodeURIComponent(
    query.trim()
  )}&size=${limit}`;
  console.log(`Searching Brreg for "${query}" from ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.brreg.enhetsregisteret.enhet.v2+json",
      },
    });

    if (!response.ok) {
      console.error(
        `Brreg search API request failed for "${query}": ${response.status} ${response.statusText}`
      );
      return [];
    }

    const data: BrregSearchResponse = await response.json();

    if (!data._embedded?.enheter) {
      console.log(`No results found for "${query}"`);
      return [];
    }

    // Map the results to our simplified format
    const results: BrregSearchItem[] = data._embedded.enheter.map((item) => ({
      orgNumber: item.organisasjonsnummer,
      name: item.navn,
      orgForm:
        item.organisasjonsform?.beskrivelse || item.organisasjonsform?.kode,
      address: item.forretningsadresse?.adresse?.join(", "),
      city: item.forretningsadresse?.poststed,
      industry: item.naeringskode1?.beskrivelse,
      numberOfEmployees: item.antallAnsatte,
      isBankrupt: item.konkurs || false,
      isWindingUp: item.underAvvikling || false,
    }));

    console.log(`Found ${results.length} results for "${query}"`);
    return results;
  } catch (error) {
    console.error(`Error searching Brreg for "${query}":`, error);
    return [];
  }
}

/**
 * Fetches data for a given organization number from the Brønnøysundregisteret API.
 * Handles basic response statuses (200 OK, 404 Not Found, 410 Gone).
 * @param orgNumber - The organization number to fetch.
 * @returns ParsedBrregData if found and parsed successfully, otherwise null.
 */
export async function fetchBrregData(
  orgNumber: string
): Promise<ParsedBrregData | null> {
  if (!orgNumber) {
    console.warn("fetchBrregData called without orgNumber");
    return null;
  }

  const url = `${BRREG_API_BASE_URL}/${orgNumber}`;
  console.log(`Fetching Brreg data for ${orgNumber} from ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.brreg.enhetsregisteret.enhet.v2+json",
      },
    });

    if (response.status === 404) {
      console.log(`Brreg data not found for ${orgNumber} (404).`);
      return null;
    }

    if (response.status === 410) {
      console.log(`Brreg data removed for ${orgNumber} (410 Gone).`);
      // TODO: Decide how to handle 'Gone' status (e.g., mark lead as inactive?)
      return null; // For now, treat as not found
    }

    if (!response.ok) {
      console.error(
        `Brreg API request failed for ${orgNumber}: ${response.status} ${response.statusText}`
      );
      // Optionally log response body for debugging
      // const errorBody = await response.text();
      // console.error('Brreg API Error Body:', errorBody);
      return null;
    }

    const data: BrregEnhet = await response.json();

    // Map raw data to our desired structure
    const parsedData: ParsedBrregData = {
      orgNumber: data.organisasjonsnummer,
      name: data.navn,
      orgForm: data.organisasjonsform?.kode,
      address: data.forretningsadresse?.adresse?.join(", "),
      postalCode: data.forretningsadresse?.postnummer,
      city: data.forretningsadresse?.poststed,
      country: data.forretningsadresse?.land,
      website: data.hjemmeside,
      industryCode: data.naeringskode1?.kode,
      industry: data.naeringskode1?.beskrivelse,
      numberOfEmployees: data.antallAnsatte,
      vatRegistered: data.registrertIMvaregisteret,
      establishedDate: data.stiftelsesdato
        ? new Date(data.stiftelsesdato)
        : undefined,
      isBankrupt: data.konkurs,
      isWindingUp: data.underAvvikling,
    };

    console.log(`Successfully parsed Brreg data for ${orgNumber}`);
    return parsedData;
  } catch (error) {
    console.error(
      `Error fetching or parsing Brreg data for ${orgNumber}:`,
      error
    );
    return null;
  }
}

/**
 * Merges parsed Brreg data with existing Business data, prioritizing existing data
 * unless it's null or undefined. Creates an update object for Prisma.
 * @param existingBusiness - The current Business object from Prisma.
 * @param brregData - The parsed data fetched from Brreg.
 * @returns An object suitable for prisma.business.update({ where: { id }, data: ... })
 */
export function mergeBrregData(
  existingBusiness: Partial<Business>, // Use Partial as we might not have the full object
  brregData: ParsedBrregData
): BusinessUpdateData {
  const updateData: BusinessUpdateData = {
    brregUpdatedAt: new Date(), // Always update the timestamp
  };

  // Helper function to add field to updateData if Brreg has a value
  // and the existing value is null/undefined
  const mergeField = <K extends keyof ParsedBrregData>(
    prismaKey: keyof BusinessUpdateData, // Use the explicit update type keyof
    brregKey: K,
    transform?: (val: NonNullable<ParsedBrregData[K]>) => any
  ) => {
    const brregValue = brregData[brregKey];
    // Check existingBusiness using the same prismaKey
    const existingValue = existingBusiness[prismaKey as keyof Business];

    if (
      brregValue !== null &&
      brregValue !== undefined &&
      (existingValue === null || existingValue === undefined)
    ) {
      // @ts-ignore - Still might need ignore if transform type is complex, but keys should match
      updateData[prismaKey] = transform ? transform(brregValue) : brregValue;
    }
  };

  // Helper function to always override field if Brreg has a value (for critical fields)
  const overrideField = <K extends keyof ParsedBrregData>(
    prismaKey: keyof BusinessUpdateData,
    brregKey: K,
    transform?: (val: NonNullable<ParsedBrregData[K]>) => any
  ) => {
    const brregValue = brregData[brregKey];
    if (brregValue !== null && brregValue !== undefined) {
      // @ts-ignore
      updateData[prismaKey] = transform ? transform(brregValue) : brregValue;
    }
  };

  // --- Map fields --- Field names MUST match Prisma schema

  // Critical fields that should always be updated from Brreg if available
  overrideField("name", "name"); // Always use the official company name from Brreg

  // Fields that only update if existing value is null/undefined
  mergeField("orgForm", "orgForm");
  mergeField("address", "address");
  mergeField("postalCode", "postalCode");
  mergeField("city", "city");
  mergeField("country", "country");
  mergeField("website", "website");
  mergeField("industryCode", "industryCode");
  mergeField("industry", "industry");
  mergeField("numberOfEmployees", "numberOfEmployees");
  mergeField("vatRegistered", "vatRegistered");
  mergeField("establishedDate", "establishedDate");
  mergeField("isBankrupt", "isBankrupt");
  mergeField("isWindingUp", "isWindingUp");

  return updateData;
}
