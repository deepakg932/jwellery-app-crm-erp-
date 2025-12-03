// data.js - Hallmark related data
export const purities = [
  { id: 1, name: "24K Gold", percentage: 99.9, symbol: "24K" },
  { id: 2, name: "22K Gold", percentage: 91.6, symbol: "22K" },
  { id: 3, name: "21K Gold", percentage: 87.5, symbol: "21K" },
  { id: 4, name: "18K Gold", percentage: 75.0, symbol: "18K" },
  { id: 5, name: "14K Gold", percentage: 58.3, symbol: "14K" },
  { id: 6, name: "10K Gold", percentage: 41.7, symbol: "10K" },
  { id: 7, name: "999 Silver", percentage: 99.9, symbol: "999" },
  { id: 8, name: "925 Silver", percentage: 92.5, symbol: "925" },
  { id: 9, name: "900 Silver", percentage: 90.0, symbol: "900" },
  { id: 10, name: "950 Platinum", percentage: 95.0, symbol: "950" },
  { id: 11, name: "900 Platinum", percentage: 90.0, symbol: "900" },
  { id: 12, name: "850 Platinum", percentage: 85.0, symbol: "850" },
];

export const marks = [
  { id: 1, name: "BIS Hallmark", code: "BIS", country: "India", authority: "Bureau of Indian Standards" },
  { id: 2, name: "Karat Stamp", code: "KT", country: "International", authority: "International Standards" },
  { id: 3, name: "Sterling Mark", code: "STER", country: "International", authority: "International Standards" },
  { id: 4, name: "Platinum Mark", code: "PT", country: "International", authority: "International Standards" },
  { id: 5, name: "Palladium Mark", code: "PD", country: "International", authority: "International Standards" },
  { id: 6, name: "Assay Office", code: "AO", country: "UK", authority: "British Hallmarking Council" },
  { id: 7, name: "Swiss Mark", code: "SWISS", country: "Switzerland", authority: "Swiss Federal Customs Administration" },
  { id: 8, name: "Italian Mark", code: "IT", country: "Italy", authority: "Italian Ministry of Economic Development" },
  { id: 9, name: "French Mark", code: "FR", country: "France", authority: "French Ministry of Economy" },
  { id: 10, name: "German Mark", code: "DE", country: "Germany", authority: "German Assay Offices" },
];

export const metalTypes = [
  { id: 1, name: "Gold", symbol: "Au", atomicNumber: 79 },
  { id: 2, name: "Silver", symbol: "Ag", atomicNumber: 47 },
  { id: 3, name: "Platinum", symbol: "Pt", atomicNumber: 78 },
  { id: 4, name: "Palladium", symbol: "Pd", atomicNumber: 46 },
  { id: 5, name: "White Gold", symbol: "Au", atomicNumber: 79 },
  { id: 6, name: "Rose Gold", symbol: "Au", atomicNumber: 79 },
  { id: 7, name: "Yellow Gold", symbol: "Au", atomicNumber: 79 },
  { id: 8, name: "Sterling Silver", symbol: "Ag", atomicNumber: 47 },
  { id: 9, name: "Britannia Silver", symbol: "Ag", atomicNumber: 47 },
  { id: 10, name: "Nickel Silver", symbol: "Ni", atomicNumber: 28 },
];

export const initialHallmarks = [
  { 
    id: 1, 
    name: "BIS 916", 
    purityId: 2, 
    purityName: "22K Gold", 
    markId: 1,
    markName: "BIS Hallmark",
    percentage: 91.6,
    metalTypeId: 1,
    metalTypeName: "Gold",
    description: "Indian BIS hallmark for 22K gold (91.6% purity)",
    status: "Active",
    yearIntroduced: 2000
  },
  { 
    id: 2, 
    name: "925 Stamp", 
    purityId: 8, 
    purityName: "925 Silver", 
    markId: 3,
    markName: "Sterling Mark",
    percentage: 92.5,
    metalTypeId: 8,
    metalTypeName: "Sterling Silver",
    description: "International sterling silver mark (92.5% purity)",
    status: "Active",
    yearIntroduced: 1300
  },
  { 
    id: 3, 
    name: "750 Mark", 
    purityId: 4, 
    purityName: "18K Gold", 
    markId: 2,
    markName: "Karat Stamp",
    percentage: 75.0,
    metalTypeId: 1,
    metalTypeName: "Gold",
    description: "18 karat gold hallmark (75% purity)",
    status: "Active",
    yearIntroduced: 1900
  },
  // Add more hallmarks as needed
];