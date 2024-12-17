// src/lib/monopoly/playerAI.ts

import { PlayerState, PropertyGroup, Property } from './types';
import { PROPERTIES, getProperty } from './board';

// Priority order for development (most valuable first)
const MONOPOLY_PRIORITY: PropertyGroup[] = [
  'darkBlue',
  'green',
  'yellow',
  'red',
  'orange',
  'pink',
  'lightBlue',
  'brown'
];

export class PlayerAI {
  /**
   * Try to build houses optimally with available cash
   */
  static buildHouses(
    playerState: PlayerState,
    availableHouses: number,
    cashBuffer: number = 0
  ): { spent: number; housesBuilt: number } {
    let spent = 0;
    let housesBuilt = 0;

    // First pass: get all monopolies to 3 houses
    for (const group of MONOPOLY_PRIORITY) {
      const propertySet = playerState.propertyGroups[group];
      if (!propertySet?.monopoly) continue;

      // Get all properties in this group
      const groupProps = PROPERTIES.filter(p => p.group === group);
      
      // Build until we have 3 houses on each property
      while (availableHouses > 0) {
        // Find property with fewest houses
        let lowestHouses = 3;
        let propertyToBuild: Property | null = null;
        
        for (const prop of groupProps) {
          const currentHouses = propertySet.houses[prop.name] || 0;
          if (currentHouses < lowestHouses && currentHouses < 3) {
            lowestHouses = currentHouses;
            propertyToBuild = prop;
          }
        }

        if (!propertyToBuild) break; // All properties have 3 houses

        // Check if we can afford it
        if (playerState.money - spent < propertyToBuild.houseCost + cashBuffer) break;

        // Build the house
        propertySet.houses[propertyToBuild.name] = (propertySet.houses[propertyToBuild.name] || 0) + 1;
        spent += propertyToBuild.houseCost;
        housesBuilt++;
        availableHouses--;
      }
    }

    // Second pass: build to hotels if we have cash left
    for (const group of MONOPOLY_PRIORITY) {
      const propertySet = playerState.propertyGroups[group];
      if (!propertySet?.monopoly) continue;

      const groupProps = PROPERTIES.filter(p => p.group === group);
      
      // Check if all properties have at least 3 houses
      const allHaveThree = groupProps.every(p => 
        (propertySet.houses[p.name] || 0) >= 3
      );

      if (!allHaveThree) continue;

      // Build remaining houses/hotels
      while (availableHouses > 0) {
        let propertyToBuild: Property | null = null;
        
        for (const prop of groupProps) {
          const currentHouses = propertySet.houses[prop.name] || 0;
          if (currentHouses < 4) {
            propertyToBuild = prop;
            break;
          }
        }

        if (!propertyToBuild) break;

        if (playerState.money - spent < propertyToBuild.houseCost + cashBuffer) break;

        propertySet.houses[propertyToBuild.name] = (propertySet.houses[propertyToBuild.name] || 0) + 1;
        spent += propertyToBuild.houseCost;
        housesBuilt++;
        availableHouses--;
      }
    }

    return { spent, housesBuilt };
  }

  /**
   * Raise money when player needs to pay more than they have
   */
  static raiseMoney(
    playerState: PlayerState,
    amountNeeded: number,
    mortgageValue: number = 0.5
  ): number {
    let raised = 0;

    // First mortgage non-monopoly properties (except railroads)
    const nonMonopolyProps = this.getNonMonopolyProperties(playerState)
      .filter(p => p.group !== 'railroad')
      .sort((a, b) => b.price - a.price); // Most expensive first

    for (const prop of nonMonopolyProps) {
      if (raised >= amountNeeded) break;
      if (this.isPropertyMortgaged(playerState, prop.name)) continue;

      raised += prop.price * mortgageValue;
      this.mortgageProperty(playerState, prop.name);
    }

    // Then mortgage railroads if still needed
    const railroads = this.getNonMonopolyProperties(playerState)
      .filter(p => p.group === 'railroad');

    for (const railroad of railroads) {
      if (raised >= amountNeeded) break;
      if (this.isPropertyMortgaged(playerState, railroad.name)) continue;

      raised += railroad.price * mortgageValue;
      this.mortgageProperty(playerState, railroad.name);
    }

    // If still short, start selling houses
    if (raised < amountNeeded) {
      const moneyFromHouses = this.sellHousesForMoney(
        playerState,
        amountNeeded - raised
      );
      raised += moneyFromHouses;
    }

    return raised;
  }

  /**
   * Get all properties that aren't part of a monopoly
   */
  private static getNonMonopolyProperties(playerState: PlayerState): Property[] {
    const properties: Property[] = [];
    
    for (const [group, propertySet] of Object.entries(playerState.propertyGroups)) {
      if (propertySet.monopoly) continue;
      
      for (const propName of propertySet.owned) {
        const prop = getProperty(propName);
        if (prop) properties.push(prop);
      }
    }

    return properties;
  }

  /**
   * Check if a property is mortgaged
   */
  private static isPropertyMortgaged(
    playerState: PlayerState,
    propertyName: string
  ): boolean {
    const property = getProperty(propertyName);
    if (!property) return false;

    const propertySet = playerState.propertyGroups[property.group];
    return propertySet?.mortgaged?.[propertyName] || false;
  }

  /**
   * Mortgage a property
   */
  private static mortgageProperty(
    playerState: PlayerState,
    propertyName: string
  ): void {
    const property = getProperty(propertyName);
    if (!property) return;

    const propertySet = playerState.propertyGroups[property.group];
    if (!propertySet) return;

    if (!propertySet.mortgaged) {
      propertySet.mortgaged = {};
    }
    propertySet.mortgaged[propertyName] = true;
  }

  /**
   * Sell houses to raise money, following priority order
   */
  private static sellHousesForMoney(
    playerState: PlayerState,
    amountNeeded: number
  ): number {
    let raised = 0;

    // Go through monopolies in reverse priority (sell cheapest houses first)
    for (const group of [...MONOPOLY_PRIORITY].reverse()) {
      const propertySet = playerState.propertyGroups[group];
      if (!propertySet?.monopoly) continue;

      const groupProps = PROPERTIES.filter(p => p.group === group);
      
      // Sell houses evenly
      while (raised < amountNeeded) {
        // Find property with most houses
        let highestHouses = 0;
        let propertyToSell: Property | null = null;
        
        for (const prop of groupProps) {
          const currentHouses = propertySet.houses[prop.name] || 0;
          if (currentHouses > highestHouses) {
            highestHouses = currentHouses;
            propertyToSell = prop;
          }
        }

        if (!propertyToSell || highestHouses === 0) break;

        // Sell the house
        propertySet.houses[propertyToSell.name]--;
        raised += propertyToSell.houseCost / 2;
      }

      // If we've sold all houses in this group and still need money,
      // mortgage the whole group
      if (raised < amountNeeded && 
          groupProps.every(p => (propertySet.houses[p.name] || 0) === 0)) {
        for (const prop of groupProps) {
          if (!this.isPropertyMortgaged(playerState, prop.name)) {
            this.mortgageProperty(playerState, prop.name);
            raised += prop.price * 0.5;
          }
        }
      }

      if (raised >= amountNeeded) break;
    }

    return raised;
  }
}