// src/lib/monopoly/test.ts

import { MonopolySimulator } from './simulator';

// Sample starting conditions
const testConditions = {
  "Player1": {
    money: 800, // Spent a lot on properties
    properties: [
      "Mediterranean Avenue",  // Has brown monopoly
      "Baltic Avenue",
      "St. Charles Place",     // Has 2/3 of pink
      "States Avenue",
      "North Carolina Avenue", // Has 2/3 of green
      "Pacific Avenue"
    ]
  },
  "Player2": {
    money: 1500,
    properties: [
      "Oriental Avenue",      // Has light blue monopoly
      "Vermont Avenue",
      "Connecticut Avenue",
      "Virginia Avenue",      // Last pink property
      "Tennessee Avenue",     // Has 2/3 of orange
      "New York Avenue"
    ]
  },
  "Player3": {
    money: 1500,
    properties: [
      "St. James Place",      // Last orange property
      "Kentucky Avenue",      // Has red monopoly
      "Indiana Avenue",
      "Illinois Avenue",
      "Pennsylvania Avenue",  // Last green property
      "Park Place",          // Has dark blue monopoly
      "Boardwalk"
    ]
  },
  "Player4": {
    money: 2000,
    properties: [
      "Reading Railroad",     // Has all railroads
      "Pennsylvania Railroad",
      "B. & O. Railroad",
      "Short Line",
      "Electric Company",     // Has both utilities
      "Water Works",
      "Atlantic Avenue",      // Has 2/3 of yellow
      "Ventnor Avenue"
    ]
  }
};

// Run simulation
const simulator = new MonopolySimulator(testConditions, 100, false); // Start with 10 games for quick testing
const results = simulator.runSimulation();

// Log results
console.log("Simulation Results:");
console.log("-----------------");
console.log(`Total Games: ${results.totalGames}`);
console.log(`Average Game Length: ${results.averageGameLength.toFixed(1)} turns`);
console.log("\nWins:");
Object.entries(results.wins).forEach(([player, wins]) => {
  console.log(`${player}: ${wins} (${(wins/results.totalGames*100).toFixed(1)}%)`);
});
console.log(`Draws: ${results.draws} (${(results.draws/results.totalGames*100).toFixed(1)}%)`);
console.log("\nBankruptcy Rates:");
Object.entries(results.bankruptcyRates).forEach(([player, rate]) => {
  console.log(`${player}: ${(rate*100).toFixed(1)}%`);
});