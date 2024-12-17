// src/lib/monopoly/board.ts

import { Property, PropertyGroup } from './types';

export const GROUP_COLORS = {
  brown: "bg-yellow-900",
  lightBlue: "bg-sky-300",
  pink: "bg-pink-400",
  orange: "bg-orange-500",
  red: "bg-red-600",
  yellow: "bg-yellow-400",
  green: "bg-green-600",
  darkBlue: "bg-blue-800",
  railroad: "bg-gray-700",
  utility: "bg-gray-500",
  default: "bg-gray-200"
} as const;

// Complete property definitions
export const PROPERTIES: Property[] = [
  // Brown Properties
  {
    name: "Mediterranean Avenue",
    group: "brown",
    price: 60,
    baseRent: 2,
    houseRent: [10, 30, 90, 160],
    hotelRent: 250,
    houseCost: 50
  },
  {
    name: "Baltic Avenue",
    group: "brown",
    price: 60,
    baseRent: 4,
    houseRent: [20, 60, 180, 320],
    hotelRent: 450,
    houseCost: 50
  },

  // Light Blue Properties
  {
    name: "Oriental Avenue",
    group: "lightBlue",
    price: 100,
    baseRent: 6,
    houseRent: [30, 90, 270, 400],
    hotelRent: 550,
    houseCost: 50
  },
  {
    name: "Vermont Avenue",
    group: "lightBlue",
    price: 100,
    baseRent: 6,
    houseRent: [30, 90, 270, 400],
    hotelRent: 550,
    houseCost: 50
  },
  {
    name: "Connecticut Avenue",
    group: "lightBlue",
    price: 120,
    baseRent: 8,
    houseRent: [40, 100, 300, 450],
    hotelRent: 600,
    houseCost: 50
  },

  // Pink Properties
  {
    name: "St. Charles Place",
    group: "pink",
    price: 140,
    baseRent: 10,
    houseRent: [50, 150, 450, 625],
    hotelRent: 750,
    houseCost: 100
  },
  {
    name: "States Avenue",
    group: "pink",
    price: 140,
    baseRent: 10,
    houseRent: [50, 150, 450, 625],
    hotelRent: 750,
    houseCost: 100
  },
  {
    name: "Virginia Avenue",
    group: "pink",
    price: 160,
    baseRent: 12,
    houseRent: [60, 180, 500, 700],
    hotelRent: 900,
    houseCost: 100
  },

  // Orange Properties
  {
    name: "St. James Place",
    group: "orange",
    price: 180,
    baseRent: 14,
    houseRent: [70, 200, 550, 700],
    hotelRent: 950,
    houseCost: 100
  },
  {
    name: "Tennessee Avenue",
    group: "orange",
    price: 180,
    baseRent: 14,
    houseRent: [70, 200, 550, 700],
    hotelRent: 950,
    houseCost: 100
  },
  {
    name: "New York Avenue",
    group: "orange",
    price: 200,
    baseRent: 16,
    houseRent: [80, 220, 600, 800],
    hotelRent: 1000,
    houseCost: 100
  },

  // Red Properties
  {
    name: "Kentucky Avenue",
    group: "red",
    price: 220,
    baseRent: 18,
    houseRent: [90, 250, 700, 875],
    hotelRent: 1050,
    houseCost: 150
  },
  {
    name: "Indiana Avenue",
    group: "red",
    price: 220,
    baseRent: 18,
    houseRent: [90, 250, 700, 875],
    hotelRent: 1050,
    houseCost: 150
  },
  {
    name: "Illinois Avenue",
    group: "red",
    price: 240,
    baseRent: 20,
    houseRent: [100, 300, 750, 925],
    hotelRent: 1100,
    houseCost: 150
  },

  // Yellow Properties
  {
    name: "Atlantic Avenue",
    group: "yellow",
    price: 260,
    baseRent: 22,
    houseRent: [110, 330, 800, 975],
    hotelRent: 1150,
    houseCost: 150
  },
  {
    name: "Ventnor Avenue",
    group: "yellow",
    price: 260,
    baseRent: 22,
    houseRent: [110, 330, 800, 975],
    hotelRent: 1150,
    houseCost: 150
  },
  {
    name: "Marvin Gardens",
    group: "yellow",
    price: 280,
    baseRent: 24,
    houseRent: [120, 360, 850, 1025],
    hotelRent: 1200,
    houseCost: 150
  },

  // Green Properties
  {
    name: "Pacific Avenue",
    group: "green",
    price: 300,
    baseRent: 26,
    houseRent: [130, 390, 900, 1100],
    hotelRent: 1275,
    houseCost: 200
  },
  {
    name: "North Carolina Avenue",
    group: "green",
    price: 300,
    baseRent: 26,
    houseRent: [130, 390, 900, 1100],
    hotelRent: 1275,
    houseCost: 200
  },
  {
    name: "Pennsylvania Avenue",
    group: "green",
    price: 320,
    baseRent: 28,
    houseRent: [150, 450, 1000, 1200],
    hotelRent: 1400,
    houseCost: 200
  },

  // Dark Blue Properties
  {
    name: "Park Place",
    group: "darkBlue",
    price: 350,
    baseRent: 35,
    houseRent: [175, 500, 1100, 1300],
    hotelRent: 1500,
    houseCost: 200
  },
  {
    name: "Boardwalk",
    group: "darkBlue",
    price: 400,
    baseRent: 50,
    houseRent: [200, 600, 1400, 1700],
    hotelRent: 2000,
    houseCost: 200
  },

  // Railroads
  {
    name: "Reading Railroad",
    group: "railroad",
    price: 200,
    baseRent: 25,
    houseRent: [],
    hotelRent: 0,
    houseCost: 0
  },
  {
    name: "Pennsylvania Railroad",
    group: "railroad",
    price: 200,
    baseRent: 25,
    houseRent: [],
    hotelRent: 0,
    houseCost: 0
  },
  {
    name: "B. & O. Railroad",
    group: "railroad",
    price: 200,
    baseRent: 25,
    houseRent: [],
    hotelRent: 0,
    houseCost: 0
  },
  {
    name: "Short Line",
    group: "railroad",
    price: 200,
    baseRent: 25,
    houseRent: [],
    hotelRent: 0,
    houseCost: 0
  },

  // Utilities
  {
    name: "Electric Company",
    group: "utility",
    price: 150,
    baseRent: 0, // Special calculation based on dice
    houseRent: [],
    hotelRent: 0,
    houseCost: 0
  },
  {
    name: "Water Works",
    group: "utility",
    price: 150,
    baseRent: 0, // Special calculation based on dice
    houseRent: [],
    hotelRent: 0,
    houseCost: 0
  }
];

// Complete board space definitions including non-property spaces
export const BOARD_SPACES = [
  'Go',
  'Mediterranean Avenue',
  'Community Chest',
  'Baltic Avenue', 
  'Income Tax',
  'Reading Railroad',
  'Oriental Avenue',
  'Chance',
  'Vermont Avenue',
  'Connecticut Avenue',
  'Jail',
  'St. Charles Place',
  'Electric Company',
  'States Avenue',
  'Virginia Avenue',
  'Pennsylvania Railroad',
  'St. James Place',
  'Community Chest',
  'Tennessee Avenue',
  'New York Avenue',
  'Free Parking',
  'Kentucky Avenue',
  'Chance',
  'Indiana Avenue',
  'Illinois Avenue',
  'B. & O. Railroad',
  'Atlantic Avenue',
  'Ventnor Avenue',
  'Water Works',
  'Marvin Gardens',
  'Go To Jail',
  'Pacific Avenue',
  'North Carolina Avenue',
  'Community Chest',
  'Pennsylvania Avenue',
  'Short Line',
  'Chance',
  'Park Place',
  'Luxury Tax',
  'Boardwalk'
];

// Helper function to get property by name
export const getProperty = (name: string): Property | null => {
  return PROPERTIES.find(p => p.name === name) || null;
};

// Helper to get property index on board
export const getPropertyPosition = (name: string): number => {
  return BOARD_SPACES.findIndex(space => space === name);
};

// Helper to get all properties in a group
export const getPropertiesInGroup = (group: PropertyGroup): Property[] => {
  return PROPERTIES.filter(p => p.group === group);
};