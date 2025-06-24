"use server";

const BRREG_API_BASE = "https://data.brreg.no/enhetsregisteret/api";

// Types based on BRREG API response structure
export interface BrregApiEnhet {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform?: {
    kode: string;
    beskrivelse: string;
  };
  naeringskode1?: {
    kode: string;
    beskrivelse: string;
  };
  naeringskode2?: {
    kode: string;
    beskrivelse: string;
  };
  naeringskode3?: {
    kode: string;
    beskrivelse: string;
  };
  hjelpeenhetskode?: {
    kode: string;
    beskrivelse: string;
  };
  antallAnsatte?: number;
  harRegistrertAntallAnsatte?: boolean;
  hjemmeside?: string;
  epostadresse?: string;
  telefon?: string;
  mobil?: string;
  forretningsadresse?: {
    adresse?: string;
    poststed?: string;
    postnummer?: string;
    kommune?: string;
    kommunenummer?: string;
    land?: string;
    landkode?: string;
  };
  postadresse?: {
    adresse?: string;
    poststed?: string;
    postnummer?: string;
    kommune?: string;
    kommunenummer?: string;
    land?: string;
    landkode?: string;
  };
  institusjonellSektorkode?: {
    kode: string;
    beskrivelse: string;
  };
  registreringsdatoEnhetsregisteret?: string;
  registrertIMvaregisteret?: boolean;
  registrertIForetaksregisteret?: boolean;
  registrertIStiftelsesregisteret?: boolean;
  registrertIFrivillighetsregisteret?: boolean;
  stiftelsesdato?: string;
  konkurs?: boolean;
  konkursdato?: string;
  underAvvikling?: boolean;
  underAvviklingDato?: string;
  underTvangsavviklingEllerTvangsopplosning?: boolean;
}

export interface BrregApiSearchResponse {
  _embedded?: {
    enheter: BrregApiEnhet[];
  };
  _links?: {
    first?: { href: string };
    prev?: { href: string };
    self?: { href: string };
    next?: { href: string };
    last?: { href: string };
  };
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface BrregApiOrgForm {
  kode: string;
  beskrivelse: string;
  _links?: {
    self?: { href: string };
  };
}

export interface BrregApiOrgFormsResponse {
  _embedded?: {
    organisasjonsformer: BrregApiOrgForm[];
  };
}

// Transform API response to match our local structure
function transformBrregApiEnhet(enhet: BrregApiEnhet) {
  // Helper function to convert array or string to string
  const arrayToString = (value: any): string | null => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return value || null;
  };

  return {
    id: enhet.organisasjonsnummer, // Use orgNumber as ID for API data
    orgNumber: enhet.organisasjonsnummer,
    name: enhet.navn,
    orgFormCode: enhet.organisasjonsform?.kode || null,
    orgFormDesc: enhet.organisasjonsform?.beskrivelse || null,
    naceCode1: enhet.naeringskode1?.kode || null,
    naceDesc1: enhet.naeringskode1?.beskrivelse || null,
    naceCode2: enhet.naeringskode2?.kode || null,
    naceDesc2: enhet.naeringskode2?.beskrivelse || null,
    naceCode3: enhet.naeringskode3?.kode || null,
    naceDesc3: enhet.naeringskode3?.beskrivelse || null,
    email: enhet.epostadresse || null,
    phone: enhet.telefon || null,
    mobile: enhet.mobil || null,
    website: enhet.hjemmeside || null,
    businessAddress: arrayToString(enhet.forretningsadresse?.adresse),
    businessCity: arrayToString(enhet.forretningsadresse?.poststed),
    businessPostalCode: arrayToString(enhet.forretningsadresse?.postnummer),
    businessMunicipality: arrayToString(enhet.forretningsadresse?.kommune),
    businessMunicipalityCode: arrayToString(
      enhet.forretningsadresse?.kommunenummer
    ),
    postalAddress: arrayToString(enhet.postadresse?.adresse),
    postalCity: arrayToString(enhet.postadresse?.poststed),
    postalPostalCode: arrayToString(enhet.postadresse?.postnummer),
    postalMunicipality: arrayToString(enhet.postadresse?.kommune),
    postalMunicipalityCode: arrayToString(enhet.postadresse?.kommunenummer),
    hasRegisteredEmployees: enhet.harRegistrertAntallAnsatte || null,
    numberOfEmployees: enhet.antallAnsatte || null,
    establishedDate: enhet.stiftelsesdato
      ? new Date(enhet.stiftelsesdato)
      : null,
    registeredDate: enhet.registreringsdatoEnhetsregisteret
      ? new Date(enhet.registreringsdatoEnhetsregisteret)
      : null,
    vatRegistered: enhet.registrertIMvaregisteret || null,
    isBankrupt: enhet.konkurs || null,
    isWindingUp: enhet.underAvvikling || null,
    // Calculate industry section from NACE code (you might want to use your existing categorizeNaceCode function)
    industrySection: enhet.naeringskode1?.kode
      ? enhet.naeringskode1.kode.charAt(0)
      : null,
    industrySectionName: null, // Would need mapping
  };
}

export async function searchBrregApiWithPagination({
  query,
  municipality,
  city,
  orgForm,
  industrySection,
  naceCode,
  vatRegistered,
  hasEmployees,
  page = 1,
  limit = 25,
}: {
  query?: string;
  municipality?: string;
  city?: string;
  orgForm?: string;
  industrySection?: string;
  naceCode?: string;
  vatRegistered?: boolean;
  hasEmployees?: boolean;
  page?: number;
  limit?: number;
}) {
  try {
    const searchParams = new URLSearchParams();

    // Add search parameters
    if (query) {
      searchParams.append("navn", query);
    }
    if (municipality) {
      searchParams.append("forretningsadresse.kommune", municipality);
    }
    if (city) {
      searchParams.append("forretningsadresse.poststed", city);
    }
    if (orgForm) {
      searchParams.append("organisasjonsform", orgForm);
    }
    if (naceCode) {
      searchParams.append("naeringskode", naceCode);
    }
    if (vatRegistered !== undefined) {
      searchParams.append("registrertIMvaregisteret", vatRegistered.toString());
    }
    if (hasEmployees !== undefined) {
      // BRREG API uses fraAntallAnsatte/tilAntallAnsatte for employee filtering
      if (hasEmployees) {
        searchParams.append("fraAntallAnsatte", "1");
      } else {
        searchParams.append("tilAntallAnsatte", "0");
      }
    }

    // Pagination
    searchParams.append("size", limit.toString());
    searchParams.append("page", (page - 1).toString()); // BRREG API uses 0-based pagination

    const url = `${BRREG_API_BASE}/enheter?${searchParams.toString()}`;

    console.log("🔍 Calling BRREG API:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "real-crm/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `BRREG API error: ${response.status} ${response.statusText}`
      );
    }

    const data: BrregApiSearchResponse = await response.json();

    const businesses = (data._embedded?.enheter || []).map(
      transformBrregApiEnhet
    );

    return {
      businesses,
      total: data.page?.totalElements || 0,
      totalPages: data.page?.totalPages || 1,
      currentPage: (data.page?.number || 0) + 1, // Convert back to 1-based
    };
  } catch (error) {
    console.error("Error calling BRREG API:", error);
    return {
      businesses: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
}

export async function getBrregApiFilterOptions() {
  try {
    // Get organization forms from BRREG API
    const orgFormsResponse = await fetch(
      `${BRREG_API_BASE}/organisasjonsformer/enheter`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "real-crm/1.0",
        },
      }
    );

    let orgForms: { code: string; description: string }[] = [];
    if (orgFormsResponse.ok) {
      const orgFormsData: BrregApiOrgFormsResponse =
        await orgFormsResponse.json();
      orgForms = (orgFormsData._embedded?.organisasjonsformer || []).map(
        (form) => ({
          code: form.kode,
          description: form.beskrivelse,
        })
      );
    }

    // For other filters, we'll need to make sample searches or use predefined lists
    // since BRREG API doesn't provide filter endpoints for all these values

    // Common Norwegian municipalities (subset)
    const commonMunicipalities = [
      "OSLO",
      "BERGEN",
      "STAVANGER",
      "TRONDHEIM",
      "FREDRIKSTAD",
      "DRAMMEN",
      "SKIEN",
      "KRISTIANSAND",
      "ÅLESUND",
      "TØNSBERG",
      "MOSS",
      "SANDEFJORD",
      "HAUGESUND",
      "ARENDAL",
      "BODØ",
      "TROMSØ",
      "HAMAR",
      "LARVIK",
    ];

    // Common Norwegian cities
    const commonCities = [
      "OSLO",
      "BERGEN",
      "STAVANGER",
      "TRONDHEIM",
      "FREDRIKSTAD",
      "DRAMMEN",
      "SKIEN",
      "KRISTIANSAND",
      "ÅLESUND",
      "TØNSBERG",
      "MOSS",
      "SANDEFJORD",
      "HAUGESUND",
      "ARENDAL",
      "BODØ",
      "TROMSØ",
      "HAMAR",
      "LARVIK",
      "LILLEHAMMER",
    ];

    // Common NACE industry sections
    const industrySections = [
      { section: "A", name: "Jordbruk, skogbruk og fiske" },
      { section: "B", name: "Bergverksdrift og utvinning" },
      { section: "C", name: "Industri" },
      { section: "D", name: "Elektrisitet, gass, damp og varmtvann" },
      { section: "E", name: "Vannforsyning, avløp, renovasjon" },
      { section: "F", name: "Bygge- og anleggsvirksomhet" },
      { section: "G", name: "Varehandel, reparasjon av motorvogner" },
      { section: "H", name: "Transport og lagring" },
      { section: "I", name: "Overnattings- og serveringsvirksomhet" },
      { section: "J", name: "Informasjon og kommunikasjon" },
      { section: "K", name: "Finansierings- og forsikringsvirksomhet" },
      { section: "L", name: "Omsetning og drift av fast eiendom" },
      { section: "M", name: "Faglig, vitenskapelig og teknisk tjenesteyting" },
      { section: "N", name: "Forretningsmessig tjenesteyting" },
      { section: "O", name: "Offentlig administrasjon og forsvar" },
      { section: "P", name: "Undervisning" },
      { section: "Q", name: "Helse- og sosialtjenester" },
      { section: "R", name: "Kultur, underholdning og fritid" },
      { section: "S", name: "Annen tjenesteyting" },
      { section: "T", name: "Lønnet arbeid i private husholdninger" },
      { section: "U", name: "Internasjonale organisasjoner" },
    ];

    // Common NACE codes (subset)
    const naceCodes = [
      { code: "41", description: "Oppføring av bygninger" },
      { code: "42", description: "Anleggsvirksomhet" },
      { code: "43", description: "Spesialisert bygge- og anleggsvirksomhet" },
      { code: "45", description: "Handel og reparasjon av motorvogner" },
      { code: "46", description: "Engroshandel, unntatt med motorvogner" },
      { code: "47", description: "Detaljhandel, unntatt med motorvogner" },
      { code: "49", description: "Landtransport og rørtransport" },
      { code: "62", description: "Tjenester tilknyttet informasjonsteknologi" },
      { code: "68", description: "Omsetning og drift av fast eiendom" },
      {
        code: "70",
        description: "Hovedkontortjenester og administrativ rådgivning",
      },
      {
        code: "71",
        description: "Arkitektvirksomhet og teknisk konsulentvirksomhet",
      },
      { code: "73", description: "Reklame og markedsundersøkelser" },
      {
        code: "74",
        description: "Annen faglig, vitenskapelig og teknisk virksomhet",
      },
      { code: "81", description: "Tjenester tilknyttet eiendomsdrift" },
      { code: "82", description: "Forretningsmessig tjenesteyting" },
    ];

    return {
      municipalities: commonMunicipalities,
      cities: commonCities,
      orgForms,
      industrySections,
      naceCodes,
    };
  } catch (error) {
    console.error("Error fetching BRREG API filter options:", error);
    return {
      municipalities: [],
      cities: [],
      orgForms: [],
      industrySections: [],
      naceCodes: [],
    };
  }
}

export async function getBrregApiCount() {
  try {
    // Make a search with size=1 to get total count
    const response = await fetch(`${BRREG_API_BASE}/enheter?size=1`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "real-crm/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `BRREG API error: ${response.status} ${response.statusText}`
      );
    }

    const data: BrregApiSearchResponse = await response.json();
    return data.page?.totalElements || 0;
  } catch (error) {
    console.error("Error getting BRREG API count:", error);
    return 0;
  }
}

export async function getBrregApiEnhet(orgNumber: string): Promise<any | null> {
  try {
    const response = await fetch(`${BRREG_API_BASE}/enheter/${orgNumber}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "real-crm/1.0",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(
        `BRREG API error: ${response.status} ${response.statusText}`
      );
    }

    const enhet: BrregApiEnhet = await response.json();
    return transformBrregApiEnhet(enhet);
  } catch (error) {
    console.error("Error fetching BRREG API enhet:", error);
    return null;
  }
}
