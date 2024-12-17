export const BASE_GROUP_NAMES = {
  brown: "Brown",
  lightBlue: "Light Blue",
  pink: "Pink",
  orange: "Orange",
  red: "Red",
  yellow: "Yellow",
  green: "Green",
  darkBlue: "Dark Blue",
  railroad: "Railroad",
  utility: "Utility"
} as const;

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

// Define our types
export type BasePropertyGroup = keyof typeof BASE_GROUP_NAMES;
export type PropertyGroup = BasePropertyGroup | 'default';

// Helper to convert display format to internal key
export const displayToGroupKey = (displayGroup: string): PropertyGroup => {
  const entry = Object.entries(BASE_GROUP_NAMES)
    .find(([_, display]) => display === displayGroup);
  return (entry?.[0] as BasePropertyGroup) || "default";
};

// Helper to get display name from internal key
export const groupKeyToDisplay = (key: PropertyGroup): string => {
  if (key === 'default') return 'Other';
  return BASE_GROUP_NAMES[key];
};