// src/lib/monopoly/types.ts

export type PropertyGroup = 
  | 'brown' 
  | 'lightBlue' 
  | 'pink' 
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'darkBlue'
  | 'railroad'
  | 'utility';

export interface Property {
  name: string;
  group: PropertyGroup;
  price: number;
  baseRent: number;
  houseRent: number[];  // Rent with 1-4 houses
  hotelRent: number;    // Rent with hotel
  houseCost: number;    // Cost per house/hotel
}

export interface PropertySet {
  owned: string[];          // Names of properties owned in this group
  monopoly: boolean;        // Whether player owns all properties in group
  houses: Record<string, number>;  // Houses on each property
  hotels: Record<string, number>;  // Hotels on each property (0 or 1)
  mortgaged: Record<string, boolean>;  // Which properties are mortgaged
}

export interface PlayerState {
  money: number;
  position: number;
  jailTurns: number;       // Number of turns in jail (0 if not in jail)
  propertyGroups: Partial<Record<PropertyGroup, PropertySet>>;
  getOutOfJailCards: number;
}

export interface GameState {
  players: Record<string, PlayerState>;
  availableHouses: number;
  availableHotels: number;
  freeParkingMoney: number;
  currentTurn: number;
  currentPlayer: string;
  winner: string | null;   // null if game ongoing
  bankruptPlayers: string[];
}

export const GAME_CONSTANTS = {
  STARTING_MONEY: 1500,
  GO_SALARY: 200,
  LUXURY_TAX: 75,
  INCOME_TAX: 200,
  INCOME_TAX_PERCENTAGE: 0.1,
  JAIL_FINE: 50,
  MAX_HOUSES: 32,
  MAX_HOTELS: 12,
  MAX_TURNS: 1000,
  MORTGAGE_RATE: 0.5,    // Get 50% of property value when mortgaging
  UNMORTGAGE_FEE: 0.1    // 10% fee to unmortgage
} as const;

export type GameAction = 
  | { type: 'ROLL_DICE' }
  | { type: 'BUY_PROPERTY' }
  | { type: 'PAY_RENT'; amount: number; to: string }
  | { type: 'BUILD_HOUSE'; property: string }
  | { type: 'BUILD_HOTEL'; property: string }
  | { type: 'SELL_HOUSE'; property: string }
  | { type: 'SELL_HOTEL'; property: string }
  | { type: 'MORTGAGE_PROPERTY'; property: string }
  | { type: 'UNMORTGAGE_PROPERTY'; property: string }
  | { type: 'PAY_TAX'; amount: number }
  | { type: 'COLLECT_GO' }
  | { type: 'GO_TO_JAIL' }
  | { type: 'GET_OUT_OF_JAIL' };

  export const GROUP_SIZES: Record<PropertyGroup, number> = {
    brown: 2,
    lightBlue: 3,
    pink: 3,
    orange: 3,
    red: 3,
    yellow: 3,
    green: 3,
    darkBlue: 2,
    railroad: 4,
    utility: 2
  };
  