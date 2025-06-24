import fs from "fs";
import path from "path";

interface PostalEntry {
  postalCode: string;
  city: string;
  municipalityCode: string;
  municipality: string;
  category: string;
}

let postalData: Map<string, PostalEntry> | null = null;
let cityList: string[] | null = null;

/**
 * Load and parse the postal register data
 */
function loadPostalData(): Map<string, PostalEntry> {
  if (postalData) {
    return postalData;
  }

  const filePath = path.join(
    process.cwd(),
    "scripts",
    "Postnummerregister-ansi.txt"
  );

  if (!fs.existsSync(filePath)) {
    console.warn("Postal register file not found, using empty dataset");
    postalData = new Map();
    return postalData;
  }

  try {
    // Read file with proper encoding handling
    const content = fs.readFileSync(filePath, "latin1"); // ANSI encoding
    const lines = content.split("\n").filter((line) => line.trim());

    postalData = new Map();

    for (const line of lines) {
      const parts = line.split("\t").map((part) => part.trim());
      if (parts.length >= 5) {
        const entry: PostalEntry = {
          postalCode: parts[0],
          city: parts[1],
          municipalityCode: parts[2],
          municipality: parts[3],
          category: parts[4],
        };
        postalData.set(entry.postalCode, entry);
      }
    }

    console.log(`Loaded ${postalData.size} postal codes`);
    return postalData;
  } catch (error) {
    console.error("Error loading postal data:", error);
    postalData = new Map();
    return postalData;
  }
}

/**
 * Get city name from postal code
 */
export function getCityFromPostalCode(postalCode: string): string | null {
  const data = loadPostalData();
  const entry = data.get(postalCode);
  return entry?.city || null;
}

/**
 * Get municipality from postal code
 */
export function getMunicipalityFromPostalCode(
  postalCode: string
): string | null {
  const data = loadPostalData();
  const entry = data.get(postalCode);
  return entry?.municipality || null;
}

/**
 * Get all unique cities sorted alphabetically
 */
export function getAllCities(): string[] {
  if (cityList) {
    return cityList;
  }

  const data = loadPostalData();
  const cities = new Set<string>();

  for (const entry of data.values()) {
    if (entry.city) {
      cities.add(entry.city);
    }
  }

  cityList = Array.from(cities).sort();
  return cityList;
}

/**
 * Search postal codes by city name
 */
export function getPostalCodesByCity(cityName: string): string[] {
  const data = loadPostalData();
  const postalCodes: string[] = [];

  for (const [code, entry] of data.entries()) {
    if (entry.city.toLowerCase() === cityName.toLowerCase()) {
      postalCodes.push(code);
    }
  }

  return postalCodes.sort();
}

/**
 * Get postal entry by postal code
 */
export function getPostalEntry(postalCode: string): PostalEntry | null {
  const data = loadPostalData();
  return data.get(postalCode) || null;
}

/**
 * Get all postal codes sorted numerically
 */
export function getAllPostalCodes(): string[] {
  const data = loadPostalData();
  return Array.from(data.keys()).sort();
}

/**
 * Get summary statistics about the postal data
 */
export function getPostalDataStats(): {
  totalPostalCodes: number;
  totalCities: number;
  citiesWithNorwegianChars: number;
} {
  const data = loadPostalData();
  const cities = getAllCities();
  const citiesWithNorwegianChars = cities.filter((city) =>
    /[ÆØÅæøå]/.test(city)
  );

  return {
    totalPostalCodes: data.size,
    totalCities: cities.length,
    citiesWithNorwegianChars: citiesWithNorwegianChars.length,
  };
}

/**
 * Clear cache (useful for testing)
 */
export function clearPostalCache(): void {
  postalData = null;
  cityList = null;
}
