// data.js - Stones and initial purities data
export const stones = [
  { id: 1, name: "Diamond", type: "Precious", hardness: 10 },
  { id: 2, name: "Ruby", type: "Precious", hardness: 9 },
  { id: 3, name: "Sapphire", type: "Precious", hardness: 9 },
  { id: 4, name: "Emerald", type: "Precious", hardness: 7.5 },
  { id: 5, name: "Gold", type: "Metal", hardness: 2.5 },
  { id: 6, name: "Silver", type: "Metal", hardness: 2.7 },
  { id: 7, name: "Platinum", type: "Metal", hardness: 4.3 },
  { id: 8, name: "Pearl", type: "Organic", hardness: 2.5 },
  { id: 9, name: "Opal", type: "Semi-Precious", hardness: 5.5 },
  { id: 10, name: "Amethyst", type: "Semi-Precious", hardness: 7 },
  { id: 11, name: "Topaz", type: "Semi-Precious", hardness: 8 },
  { id: 12, name: "Garnet", type: "Semi-Precious", hardness: 7.5 },
];

export const initialPurities = [
  { 
    id: 1, 
    name: "24K Gold", 
    stoneId: 5, 
    stoneName: "Gold", 
    percentage: 99.9,
    image: null,
    description: "Pure gold with 99.9% purity",
    color: "#FFD700",
    karat: 24
  },
  { 
    id: 2, 
    name: "925 Sterling Silver", 
    stoneId: 6, 
    stoneName: "Silver", 
    percentage: 92.5,
    image: null,
    description: "Sterling silver with 92.5% purity",
    color: "#C0C0C0",
    karat: null
  },
  { 
    id: 3, 
    name: "VVS Diamond", 
    stoneId: 1, 
    stoneName: "Diamond", 
    percentage: 99.5,
    image: null,
    description: "Very Very Slightly Included diamond",
    color: "#FFFFFF",
    clarity: "VVS"
  },
  { 
    id: 4, 
    name: "18K Gold", 
    stoneId: 5, 
    stoneName: "Gold", 
    percentage: 75.0,
    image: null,
    description: "18 karat gold with 75% purity",
    color: "#FFD700",
    karat: 18
  },
  { 
    id: 5, 
    name: "950 Platinum", 
    stoneId: 7, 
    stoneName: "Platinum", 
    percentage: 95.0,
    image: null,
    description: "Platinum with 95% purity",
    color: "#E5E4E2",
    karat: null
  },
  { 
    id: 6, 
    name: "14K Gold", 
    stoneId: 5, 
    stoneName: "Gold", 
    percentage: 58.3,
    image: null,
    description: "14 karat gold with 58.3% purity",
    color: "#FFD700",
    karat: 14
  },
  { 
    id: 7, 
    name: "800 Silver", 
    stoneId: 6, 
    stoneName: "Silver", 
    percentage: 80.0,
    image: null,
    description: "Silver with 80% purity",
    color: "#C0C0C0",
    karat: null
  },
  { 
    id: 8, 
    name: "IF Diamond", 
    stoneId: 1, 
    stoneName: "Diamond", 
    percentage: 99.8,
    image: null,
    description: "Internally Flawless diamond",
    color: "#FFFFFF",
    clarity: "IF"
  },
];