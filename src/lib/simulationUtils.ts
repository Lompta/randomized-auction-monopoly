import { MonopolySimulator } from './monopoly/simulator';
import type { SimulationResult } from './monopoly/simulator';

// Interface for frontend game state
interface PlayerState {
  money: number;
  properties: Array<{
    name: string;
    group: string;
    price: number;
  }>;
}

interface Players {
  [key: string]: PlayerState;
}

// Convert simulation results to match the UI's expected format
export interface UISimulationResults {
  games_played: number;
  clear_wins: number;
  draws: number;
  draw_percentage: string;
  survival_rates: {
    [key: string]: string;
  };
  bankruptcies: {
    [key: string]: number;
  };
  average_rounds: number;
}

/**
 * Convert the UI's game state into the format expected by the simulator
 */
const prepareSimulationPayload = (players: Players) => {
  return Object.entries(players).reduce((acc, [playerName, state]) => ({
    ...acc,
    [playerName]: {
      money: state.money,
      properties: state.properties.map(prop => prop.name)
    }
  }), {});
};

/**
 * Convert simulator results into the format expected by the UI
 */
const formatSimulationResults = (results: SimulationResult): UISimulationResults => {
  return {
    games_played: results.totalGames,
    clear_wins: Object.values(results.wins).reduce((sum, wins) => sum + wins, 0),
    draws: results.draws,
    draw_percentage: `${(results.draws / results.totalGames * 100).toFixed(1)}%`,
    survival_rates: Object.entries(results.wins).reduce((acc, [player, wins]) => ({
      ...acc,
      [player]: `${(wins / results.totalGames * 100).toFixed(1)}%`
    }), {}),
    bankruptcies: Object.entries(results.bankruptcyRates).reduce((acc, [player, rate]) => ({
      ...acc,
      [player]: Math.round(rate * results.totalGames)
    }), {}),
    average_rounds: Math.round(results.averageGameLength)
  };
};

/**
 * Run simulation using the internal simulator
 */
export const runSimulation = async (gameState: Players): Promise<UISimulationResults> => {
  return new Promise((resolve) => {
    // Convert game state to simulator format
    const simulatorInput = prepareSimulationPayload(gameState);
    
    // Create and run simulator
    const simulator = new MonopolySimulator(simulatorInput, 100, false);
    const results = simulator.runSimulation();
    
    // Convert results to UI format and resolve
    resolve(formatSimulationResults(results));
  });
};