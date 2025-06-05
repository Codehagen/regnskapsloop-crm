import { Business, Contact, Activity, Offer, OfferItem } from "./types";

// Mock data for businesses
const mockBusinesses: Business[] = [
  {
    id: "l001",
    name: "Norsk Teknologi AS",
    orgNumber: "912345678",
    address: "Teknologiveien 1",
    postalCode: "0371",
    city: "Oslo",
    country: "Norge",
    contactPerson: "Ola Nordmann",
    email: "kontakt@norskteknologi.no",
    phone: "22334455",
    website: "https://www.norskteknologi.no",
    industry: "IT og Teknologi",
    numberOfEmployees: 25,
    revenue: 15000000,
    notes: "Ledende teknologibedrift innen software utvikling.",
    createdAt: new Date("2022-01-15"),
    updatedAt: new Date("2023-09-10"),
    bilagCount: 12,
    status: "active",
    tags: ["tech", "software", "consulting"],
    contacts: [
      {
        id: "c001",
        name: "Ola Nordmann",
        email: "ola@norskteknologi.no",
        phone: "99887766",
        position: "Daglig leder",
        isPrimary: true,
        businessId: "l001",
        notes: "Primær kontaktperson",
      },
      {
        id: "c002",
        name: "Kari Olsen",
        email: "kari@norskteknologi.no",
        phone: "99887755",
        position: "Økonomisjef",
        isPrimary: false,
        businessId: "l001",
      },
    ],
    activities: [
      {
        id: "a001",
        type: "meeting",
        date: new Date("2023-08-15"),
        description: "Innledende møte om prosjektmuligheter",
        businessId: "l001",
        contactId: "c001",
        userId: "u001",
        completed: true,
        outcome: "Positiv respons, ønsker tilbud",
      },
      {
        id: "a002",
        type: "call",
        date: new Date("2023-09-05"),
        description: "Oppfølgingssamtale",
        businessId: "l001",
        contactId: "c001",
        userId: "u001",
        completed: true,
        outcome: "Diskuterte spesifikke behov",
      },
    ],
    offers: [
      {
        id: "o001",
        title: "Programvareutvikling 2023",
        description: "Tilbud på utvikling av kundeportal",
        businessId: "l001",
        contactId: "c001",
        createdAt: new Date("2023-09-10"),
        expiresAt: new Date("2023-10-10"),
        status: "sent",
        totalAmount: 450000,
        currency: "NOK",
        items: [
          {
            id: "oi001",
            description: "Frontend utvikling",
            quantity: 1,
            unitPrice: 250000,
            discount: 10,
            tax: 25,
            total: 225000,
          },
          {
            id: "oi002",
            description: "Backend utvikling",
            quantity: 1,
            unitPrice: 225000,
            tax: 25,
            total: 225000,
          },
        ],
        notes: "Tilbudet inkluderer 3 måneders support etter leveranse",
      },
    ],
  },
  {
    id: "l002",
    name: "Hansen Konsult",
    orgNumber: "923456789",
    address: "Konsulentveien 5",
    postalCode: "5008",
    city: "Bergen",
    country: "Norge",
    contactPerson: "Kari Hansen",
    email: "post@hansenkonsult.no",
    phone: "55334455",
    industry: "Konsulentvirksomhet",
    numberOfEmployees: 10,
    createdAt: new Date("2022-03-20"),
    updatedAt: new Date("2023-08-05"),
    bilagCount: 8,
    status: "active",
    tags: ["consulting", "management"],
    contacts: [
      {
        id: "c003",
        name: "Kari Hansen",
        email: "kari@bedrift.no",
        phone: "45678901",
        position: "Partner",
        isPrimary: true,
        businessId: "l002",
      },
    ],
  },
  {
    id: "l003",
    name: "Johansen og Sønner",
    orgNumber: "934567890",
    address: "Håndverksgata 12",
    postalCode: "7010",
    city: "Trondheim",
    country: "Norge",
    contactPerson: "Lars Johansen",
    email: "post@johansensønner.no",
    phone: "73557788",
    website: "https://www.johansensønner.no",
    industry: "Håndverk",
    numberOfEmployees: 15,
    createdAt: new Date("2021-11-10"),
    updatedAt: new Date("2023-07-15"),
    bilagCount: 24,
    status: "active",
    contacts: [
      {
        id: "c004",
        name: "Lars Johansen",
        email: "lars@firma.no",
        phone: "91234567",
        position: "Daglig leder",
        isPrimary: true,
        businessId: "l003",
      },
    ],
  },
];

// Mock API functions
export async function getBusinesses(): Promise<Business[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockBusinesses;
}

export async function getBusinessById(id: string): Promise<Business | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockBusinesses.find((business) => business.id === id) || null;
}

export async function getBusinessContacts(
  businessId: string
): Promise<Contact[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  const business = mockBusinesses.find((b) => b.id === businessId);
  return business?.contacts || [];
}

export async function getBusinessActivities(
  businessId: string
): Promise<Activity[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  const business = mockBusinesses.find((b) => b.id === businessId);
  return business?.activities || [];
}

export async function getBusinessOffers(businessId: string): Promise<Offer[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  const business = mockBusinesses.find((b) => b.id === businessId);
  return business?.offers || [];
}

// Additional functions for a real API would go here
