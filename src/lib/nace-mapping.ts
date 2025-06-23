// NACE/SN2007 industry classification mapping (same as Proff.no uses)
export interface IndustrySection {
  code: string; // A-U
  name: string; // Norwegian name
  naceCodes: string[]; // NACE code prefixes that belong to this section
}

export const INDUSTRY_SECTIONS: IndustrySection[] = [
  {
    code: "A",
    name: "Jordbruk, skogbruk og fiske",
    naceCodes: ["01", "02", "03"],
  },
  {
    code: "B",
    name: "Bergverksdrift og utvinning",
    naceCodes: ["05", "06", "07", "08", "09"],
  },
  {
    code: "C",
    name: "Industri",
    naceCodes: [
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
      "32",
      "33",
    ],
  },
  {
    code: "D",
    name: "Elektrisitets-, gass-, damp- og varmtvannsforsyning",
    naceCodes: ["35"],
  },
  {
    code: "E",
    name: "Vannforsyning, avløps- og renovasjonsvirksomhet",
    naceCodes: ["36", "37", "38", "39"],
  },
  {
    code: "F",
    name: "Bygge- og anleggsvirksomhet",
    naceCodes: ["41", "42", "43"],
  },
  {
    code: "G",
    name: "Varehandel, reparasjon av motorvogner",
    naceCodes: ["45", "46", "47"],
  },
  {
    code: "H",
    name: "Transport og lagring",
    naceCodes: ["49", "50", "51", "52", "53"],
  },
  {
    code: "I",
    name: "Overnattings- og serveringsvirksomhet",
    naceCodes: ["55", "56"],
  },
  {
    code: "J",
    name: "Informasjon og kommunikasjon",
    naceCodes: ["58", "59", "60", "61", "62", "63"],
  },
  {
    code: "K",
    name: "Finansiering og forsikring",
    naceCodes: ["64", "65", "66"],
  },
  {
    code: "L",
    name: "Omsetning og drift av fast eiendom",
    naceCodes: ["68"],
  },
  {
    code: "M",
    name: "Faglig, vitenskapelig og teknisk tjenesteyting",
    naceCodes: ["69", "70", "71", "72", "73", "74", "75"],
  },
  {
    code: "N",
    name: "Forretningsmessig tjenesteyting",
    naceCodes: ["77", "78", "79", "80", "81", "82"],
  },
  {
    code: "O",
    name: "Offentlig administrasjon og forsvar; trygdeordninger underlagt offentlig forvaltning",
    naceCodes: ["84"],
  },
  {
    code: "P",
    name: "Undervisning",
    naceCodes: ["85"],
  },
  {
    code: "Q",
    name: "Helse- og sosialtjenester",
    naceCodes: ["86", "87", "88"],
  },
  {
    code: "R",
    name: "Kultur, underholdning og fritid",
    naceCodes: ["90", "91", "92", "93"],
  },
  {
    code: "S",
    name: "Annen tjenesteyting",
    naceCodes: ["94", "95", "96"],
  },
  {
    code: "T",
    name: "Private husholdninger med ansatt hjelp; produksjon av varer og tjenester i husholdninger til eget bruk",
    naceCodes: ["97", "98"],
  },
  {
    code: "U",
    name: "Internasjonale organisasjoner og organer",
    naceCodes: ["99"],
  },
];

// Create a lookup map for faster categorization
export const NACE_TO_SECTION: { [key: string]: IndustrySection } = {};

// Build the lookup map
INDUSTRY_SECTIONS.forEach((section) => {
  section.naceCodes.forEach((nacePrefix) => {
    NACE_TO_SECTION[nacePrefix] = section;
  });
});

/**
 * Categorizes a NACE code into a Proff-style industry section
 * @param naceCode - The NACE code (e.g., "43.210" or "43210")
 * @returns Industry section info or null if not found
 */
export function categorizeNaceCode(
  naceCode: string | null | undefined
): { section: string; sectionName: string } | null {
  if (!naceCode) return null;

  // Extract the first two digits from NACE code
  const cleanCode = naceCode.replace(/[^0-9]/g, "");
  if (cleanCode.length < 2) return null;

  const twoDigitCode = cleanCode.substring(0, 2);
  const section = NACE_TO_SECTION[twoDigitCode];

  if (section) {
    return {
      section: section.code,
      sectionName: section.name,
    };
  }

  return null;
}
