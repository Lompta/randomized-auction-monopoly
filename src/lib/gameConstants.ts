import { Property } from './monopoly/types';
import type { UISimulationResults } from './simulationUtils';

export interface GameSettings {
  simultaneousMode: boolean;
}

export interface PlayerState {
  money: number;
  properties: Property[];
}

export interface Players {
  [key: string]: PlayerState;
}

export interface AuctionResult {
  property: Property;
  winner: string;
  amount: number;
  allBids: { [player: string]: number };
}

export interface GameState {
  stage: 'auction' | 'results';
  settings: GameSettings;
  players: Players;
  currentProperty: Property | null;
  properties: Property[];
  currentBids: { [key: string]: number };
  biddingComplete: { [key: string]: boolean };
  consecutivePasses: number;
  currentPlayerIndex: number;
  simulationResults: UISimulationResults | null;
  unownedProperties: Property[];
  auctionHistory: AuctionResult[];
}

export const INITIAL_GAME_SETTINGS: GameSettings = {
  simultaneousMode: false,
};

export const INITIAL_MONEY = 1500;

export const INITIAL_GAME_STATE: GameState = {
  stage: 'auction',
  settings: INITIAL_GAME_SETTINGS,
  players: {},
  currentProperty: null,
  properties: [],
  currentBids: {},
  biddingComplete: {},
  consecutivePasses: 0,
  currentPlayerIndex: 0,
  simulationResults: null,
  unownedProperties: [],
  auctionHistory: [],
};