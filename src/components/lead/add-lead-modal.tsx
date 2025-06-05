"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconLoader,
  IconSearch,
  IconMapPin,
  IconUsers,
  IconBuilding,
} from "@tabler/icons-react";
import {
  createLeadFromOrgNumber,
  searchCompaniesByName,
} from "@/app/actions/leads/actions";
import { BrregSearchItem } from "@/lib/brreg";

interface AddLeadModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaceId: string;
}

export function AddLeadModal({
  isOpen,
  onOpenChange,
  workspaceId,
}: AddLeadModalProps) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BrregSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputType, setInputType] = useState<"name" | "orgnumber" | "unknown">(
    "unknown"
  );
  const router = useRouter();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to detect if input is an organization number
  const detectInputType = (input: string): "name" | "orgnumber" | "unknown" => {
    const cleanInput = input.trim().replace(/\s+/g, "").replace(/-/g, "");

    // Norwegian org numbers are typically 9 digits
    if (/^\d{9}$/.test(cleanInput)) {
      return "orgnumber";
    }

    // If it's mostly numbers but not exactly 9 digits, it might be a partial org number
    if (/^\d+$/.test(cleanInput) && cleanInput.length > 0) {
      return cleanInput.length < 9 ? "orgnumber" : "unknown";
    }

    // If it contains letters, it's likely a company name
    if (/[a-zA-ZæøåÆØÅ]/.test(input) && input.trim().length >= 2) {
      return "name";
    }

    return "unknown";
  };

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const currentInputType = detectInputType(query);
    setInputType(currentInputType);

    // Only search by name if it's detected as a name and has at least 2 characters
    if (currentInputType === "name" && query.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const result = await searchCompaniesByName(query);
          if (result.success && result.data) {
            setSearchResults(result.data);
            setShowDropdown(true);
          } else {
            setSearchResults([]);
            setShowDropdown(false);
          }
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
          setShowDropdown(false);
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce
    } else {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;

    const currentInputType = detectInputType(query);

    if (currentInputType === "orgnumber") {
      // Clean the org number (remove spaces and dashes)
      const cleanOrgNumber = query.trim().replace(/\s+/g, "").replace(/-/g, "");
      await createLead(cleanOrgNumber);
    } else if (currentInputType === "name") {
      // If it's a name but no results in dropdown, show message
      toast.error(
        "Vennligst velg en bedrift fra søkeresultatene eller skriv inn et organisasjonsnummer."
      );
    }
  };

  const handleSelectCompany = async (company: BrregSearchItem) => {
    setShowDropdown(false);
    setQuery("");
    await createLead(company.orgNumber);
  };

  const createLead = async (orgNumber: string) => {
    setIsLoading(true);
    toast.loading("Søker etter og oppretter lead...");

    try {
      const result = await createLeadFromOrgNumber(orgNumber, workspaceId);
      toast.dismiss();

      if (result.success && result.data) {
        toast.success(result.message);
        resetForm();
        onOpenChange(false);
        router.push(`/leads/${result.data.id}`);
      } else if (!result.success && result.data) {
        toast.info(`${result.message} Videresender til eksisterende lead...`);
        resetForm();
        onOpenChange(false);
        router.push(`/leads/${result.data.id}`);
      } else {
        toast.error(result.message || "En ukjent feil oppstod.");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Failed to create lead:", error);
      toast.error("En uventet feil oppstod under oppretting.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setInputType("unknown");
  };

  const formatEmployeeCount = (count?: number) => {
    if (!count) return "";
    if (count === 1) return "1 ansatt";
    return `${count} ansatte`;
  };

  const getPlaceholderText = () => {
    switch (inputType) {
      case "orgnumber":
        return "Skriv inn organisasjonsnummer (9 siffer)";
      case "name":
        return "Søk etter bedriftsnavn...";
      default:
        return "Skriv bedriftsnavn eller organisasjonsnummer";
    }
  };

  const getInputIcon = () => {
    switch (inputType) {
      case "orgnumber":
        return (
          <IconBuilding className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        );
      case "name":
        return (
          <IconSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        );
      default:
        return (
          <IconSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        );
    }
  };

  const canSubmit = () => {
    return (
      inputType === "orgnumber" &&
      query.trim().replace(/\s+/g, "").replace(/-/g, "").length === 9
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Legg til nytt Lead</DialogTitle>
          <DialogDescription>
            Søk etter bedriftsnavn eller skriv inn organisasjonsnummer for å
            hente bedriftsdata automatisk fra Brønnøysundregistrene.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="relative" ref={dropdownRef}>
              <Label className="pb-2" htmlFor="query">
                Bedrift
              </Label>
              <div className="relative">
                {getInputIcon()}
                <Input
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                  placeholder={getPlaceholderText()}
                  disabled={isLoading}
                />
                {isSearching && (
                  <IconLoader className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>

              {/* Input type indicator */}
              {query.trim() && (
                <div className="mt-1 text-xs text-gray-500">
                  {inputType === "orgnumber" && (
                    <span className="flex items-center">
                      <IconBuilding className="w-3 h-3 mr-1" />
                      Organisasjonsnummer
                    </span>
                  )}
                  {inputType === "name" && (
                    <span className="flex items-center">
                      <IconSearch className="w-3 h-3 mr-1" />
                      Søker etter bedriftsnavn...
                    </span>
                  )}
                </div>
              )}

              {/* Search Results Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((company) => (
                    <button
                      key={company.orgNumber}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
                      onClick={() => handleSelectCompany(company)}
                      disabled={isLoading}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {company.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Org.nr: {company.orgNumber}
                          </div>
                          {(company.address || company.city) && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <IconMapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {[company.address, company.city]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                          {company.industry && (
                            <div className="text-sm text-gray-400 truncate">
                              {company.industry}
                            </div>
                          )}
                        </div>
                        {company.numberOfEmployees && (
                          <div className="flex items-center text-sm text-gray-500 ml-2 flex-shrink-0">
                            <IconUsers className="w-3 h-3 mr-1" />
                            {formatEmployeeCount(company.numberOfEmployees)}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showDropdown &&
                searchResults.length === 0 &&
                !isSearching &&
                inputType === "name" && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
                    Ingen bedrifter funnet for "{query}"
                  </div>
                )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isLoading || !canSubmit()}>
              {isLoading ? (
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? "Søker..." : "Opprett Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
