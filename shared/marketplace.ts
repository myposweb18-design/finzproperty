export type PropertyIntent = "buy" | "rent";
export type PropertyKind = "House" | "Apartment" | "Land" | "Commercial" | "Bungalow" | "Villa" | "Studio" | "Annex" | "Hostel" | "Room";

export type Property = {
  isDemo?: boolean;
  subtype?: string;
  shortTerm?: boolean;
  urgent?: boolean;
  ready?: boolean;
  offPlan?: boolean;
  videoUrl?: string;
  tourUrl?: string;
  developmentId?: number;
  createdAt?: Date;
  id: number;
  slug: string;
  title: string;
  intent: PropertyIntent;
  kind: PropertyKind;
  location: string;
  district: string;
  city: string;
  price: number;
  priceLabel?: string;
  bedrooms: number;
  bathrooms: number;
  landSize?: string;
  floorArea?: string;
  image: string;
  gallery: string[];
  featured?: boolean;
  verified?: boolean;
  tag?: string;
  agentId: number;
  agentName: string;
  agentCompany: string;
  agentAvatar: string;
  description: string;
  amenities: string[];
  posted: string;
  status: "active" | "pending" | "sold";
};

export type Agent = {
  isDemo?: boolean;
  id: number;
  slug: string;
  name: string;
  company: string;
  location: string;
  avatar: string;
  verified: boolean;
  phone: string;
  listings: number;
  bio: string;
};

export type Development = {
  isDemo?: boolean;
  id: number;
  slug: string;
  name: string;
  developer: string;
  location: string;
  status: string;
  fromPrice: number;
  units: string;
  image: string;
  accent: string;
};

export const seedAgents: Agent[] = [
  { id: 1, slug: "sanjaya-perera", name: "Sanjaya Perera", company: "Lanka Prime Realty", location: "Colombo 03", avatar: "https://i.pravatar.cc/160?img=12", verified: true, phone: "+94 77 245 9081", listings: 18, bio: "Helping families and investors make confident moves across Colombo's most sought-after neighbourhoods." },
  { id: 2, slug: "amira-wijesinghe", name: "Amira Wijesinghe", company: "Coastline Estates", location: "Galle", avatar: "https://i.pravatar.cc/160?img=47", verified: true, phone: "+94 76 590 1188", listings: 11, bio: "Specialist in coastal homes, boutique hospitality assets, and land opportunities in the south." },
  { id: 3, slug: "dinesh-jayawardena", name: "Dinesh Jayawardena", company: "Ceylon Land Co.", location: "Kandy", avatar: "https://i.pravatar.cc/160?img=53", verified: false, phone: "+94 71 402 6602", listings: 9, bio: "A local property advisor focused on land, family homes, and long-term value in the hill country." },
];

export const seedProperties: Property[] = [
  {
    id: 1, slug: "park-lane-residence-colombo-03", title: "Park Lane Residence with garden terrace", intent: "buy", kind: "House", location: "Park Lane, Colombo 03", district: "Colombo", city: "Colombo", price: 148000000, bedrooms: 4, bathrooms: 4, landSize: "10.5 perches", floorArea: "3,180 sq ft", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85", gallery: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85"], featured: true, verified: true, tag: "EDITOR'S PICK", agentId: 1, agentName: "Sanjaya Perera", agentCompany: "Lanka Prime Realty", agentAvatar: "https://i.pravatar.cc/160?img=12", description: "A quietly exceptional family residence in a leafy pocket of Colombo 03. The home balances generous proportions with warm timber details, a private garden terrace, and effortless access to schools, dining, and the city. Presented by a verified FinzProperty partner.", amenities: ["Private garden", "Backup generator", "2 covered parking bays", "Maid's quarters", "Solar hot water", "Gated access"], posted: "2 days ago", status: "active",
  },
  {
    id: 2, slug: "harbour-view-apartment-colombo-02", title: "Harbour view apartment at Cinnamon Life", intent: "rent", kind: "Apartment", location: "Colombo 02", district: "Colombo", city: "Colombo", price: 325000, bedrooms: 2, bathrooms: 2, floorArea: "1,240 sq ft", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85", gallery: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=85"], featured: true, verified: true, tag: "NEWLY LISTED", agentId: 1, agentName: "Sanjaya Perera", agentCompany: "Lanka Prime Realty", agentAvatar: "https://i.pravatar.cc/160?img=12", description: "Wake up to a soft harbour horizon from this beautifully finished two-bedroom residence. Enjoy resort-style amenities, 24-hour security, and a polished city lifestyle in the heart of Colombo 02.", amenities: ["Infinity pool", "Fitness centre", "Concierge", "Sea view", "Fully furnished", "24-hour security"], posted: "4 hours ago", status: "active",
  },
  {
    id: 3, slug: "coconut-grove-koggala-land", title: "Coconut grove minutes from Koggala Lake", intent: "buy", kind: "Land", location: "Koggala, Galle", district: "Galle", city: "Koggala", price: 18500000, bedrooms: 0, bathrooms: 0, landSize: "42 perches", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85", gallery: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=85"], verified: true, tag: "LAND", agentId: 2, agentName: "Amira Wijesinghe", agentCompany: "Coastline Estates", agentAvatar: "https://i.pravatar.cc/160?img=47", description: "A lush, level parcel in a quiet residential pocket close to Koggala Lake and the south coast. Ideal for a private retreat, small villa compound, or long-term land bank.", amenities: ["Clear deed", "Road frontage", "Electricity nearby", "Water access", "10 min to beach"], posted: "1 day ago", status: "active",
  },
  {
    id: 4, slug: "havelock-city-residence", title: "Light-filled three-bedroom city residence", intent: "buy", kind: "Apartment", location: "Havelock City, Colombo 05", district: "Colombo", city: "Colombo", price: 67500000, bedrooms: 3, bathrooms: 3, floorArea: "1,685 sq ft", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85", gallery: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85"], featured: true, verified: true, tag: "FEATURED", agentId: 1, agentName: "Sanjaya Perera", agentCompany: "Lanka Prime Realty", agentAvatar: "https://i.pravatar.cc/160?img=12", description: "A calm, contemporary apartment with generous living spaces, a deep balcony, and access to one of Colombo's most complete residential communities.", amenities: ["Pool & gym", "Children's playroom", "Secure parking", "City views", "Retail precinct", "Pet friendly"], posted: "5 days ago", status: "active",
  },
  {
    id: 5, slug: "kandy-hillside-family-home", title: "Hillside family home with valley outlook", intent: "buy", kind: "House", location: "Ampitiya, Kandy", district: "Kandy", city: "Kandy", price: 39500000, bedrooms: 5, bathrooms: 3, landSize: "24 perches", floorArea: "2,650 sq ft", image: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1200&q=85", gallery: ["https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85"], verified: true, tag: "FAMILY HOME", agentId: 3, agentName: "Dinesh Jayawardena", agentCompany: "Ceylon Land Co.", agentAvatar: "https://i.pravatar.cc/160?img=53", description: "A generous five-bedroom home set above Kandy with cool breezes, mature planting, and broad valley views. A rare combination of privacy, access, and usable outdoor space.", amenities: ["Valley outlook", "Mature garden", "Study", "Garage", "Quiet lane"], posted: "1 week ago", status: "active",
  },
  {
    id: 6, slug: "galle-fort-boutique-villa", title: "Boutique villa near Galle Fort", intent: "rent", kind: "House", location: "Fort, Galle", district: "Galle", city: "Galle", price: 485000, bedrooms: 3, bathrooms: 3, floorArea: "2,100 sq ft", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=85", gallery: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85"], verified: true, tag: "COASTAL LIVING", agentId: 2, agentName: "Amira Wijesinghe", agentCompany: "Coastline Estates", agentAvatar: "https://i.pravatar.cc/160?img=47", description: "A considered three-bedroom villa tucked into a quiet lane near the Fort. Designed for slow mornings, long lunches, and easy access to the best of Galle's old town.", amenities: ["Plunge pool", "Courtyard", "Furnished", "Walk to Fort", "Weekly housekeeping"], posted: "3 days ago", status: "active",
  },
  {
    id: 7, slug: "union-place-office-suite", title: "Refined office suite with city access", intent: "rent", kind: "Commercial", location: "Union Place, Colombo 02", district: "Colombo", city: "Colombo", price: 720000, bedrooms: 0, bathrooms: 2, floorArea: "2,950 sq ft", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85", gallery: ["https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85"], tag: "COMMERCIAL", agentId: 1, agentName: "Sanjaya Perera", agentCompany: "Lanka Prime Realty", agentAvatar: "https://i.pravatar.cc/160?img=12", description: "A bright, efficient office floor with an understated hospitality feel. Flexible plan, excellent access, and a professional arrival experience for growing teams.", amenities: ["Reception", "Meeting rooms", "Backup power", "Lift access", "Parking available"], posted: "6 days ago", status: "active",
  },
  {
    id: 8, slug: "rajagiriya-modern-townhouse", title: "Modern townhouse with private roof terrace", intent: "buy", kind: "House", location: "Rajagiriya, Colombo", district: "Colombo", city: "Rajagiriya", price: 52000000, bedrooms: 3, bathrooms: 3, landSize: "6 perches", floorArea: "1,980 sq ft", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85", gallery: ["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=85"], verified: true, tag: "MOVE-IN READY", agentId: 3, agentName: "Dinesh Jayawardena", agentCompany: "Ceylon Land Co.", agentAvatar: "https://i.pravatar.cc/160?img=53", description: "A well-planned townhouse for modern city living, with a rooftop terrace, clean lines, and an enviable location close to Rajagiriya's everyday conveniences.", amenities: ["Roof terrace", "Three levels", "Carport", "Smart access", "New build"], posted: "2 weeks ago", status: "active",
  },
];

export const seedDevelopments: Development[] = [
  { id: 1, slug: "port-city-residences", name: "Port City Residences", developer: "Colombo Waterfront", location: "Colombo 01", status: "Launching soon", fromPrice: 78000000, units: "1–3 bed residences", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85", accent: "from-[#102b45] to-[#234d66]" },
  { id: 2, slug: "parkland-kotte", name: "Parkland Kotte", developer: "Urban Habitat", location: "Sri Jayawardenepura Kotte", status: "Construction 2026", fromPrice: 46500000, units: "2–4 bed apartments", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85", accent: "from-[#31534c] to-[#6a8b70]" },
  { id: 3, slug: "south-coast-villas", name: "South Coast Villas", developer: "Ceylon Shores", location: "Weligama, Galle", status: "Now selling", fromPrice: 92000000, units: "Private villas", image: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1200&q=85", accent: "from-[#856a42] to-[#cfad72]" },
];

export function formatLkr(value: number, intent: PropertyIntent = "buy") {
  if (intent === "rent") return `LKR ${new Intl.NumberFormat("en-LK").format(value)} / month`;
  if (value >= 1_000_000_000) return `LKR ${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `LKR ${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  return `LKR ${new Intl.NumberFormat("en-LK").format(value)}`;
}
