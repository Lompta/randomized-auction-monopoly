// src/lib/monopoly/engine.ts

import { 
    GameState, 
    PlayerState, 
    Property,
    PropertyGroup,
    PropertySet,
    GAME_CONSTANTS,
    GROUP_SIZES,
    GameAction
  } from './types';
  import { BOARD_SPACES, PROPERTIES, getProperty } from './board';
import { PlayerAI } from './playerAI';
  
  interface GameLog {
    turn: number;
    player: string;
    action: GameAction;
    resultingState: GameState;
  }
  
  interface PlayerStartingCondition {
    money: number;
    properties: string[];
  }
  
  export class MonopolyEngine {
    private state: GameState;
    private logs: GameLog[] = [];
    private debug: boolean;
  
    constructor(
      playerConditions: Record<string, PlayerStartingCondition>,
      debug = false
    ) {
      this.debug = debug;
      this.state = this.initializeGame(playerConditions);
      this.assignInitialProperties(
        Object.fromEntries(
          Object.entries(playerConditions).map(([name, condition]) => [
            name, 
            condition.properties
          ])
        )
      );
    }
  
    private initializeGame(
      playerConditions: Record<string, PlayerStartingCondition>
    ): GameState {
      const players: Record<string, PlayerState> = {};
      
      for (const [name, condition] of Object.entries(playerConditions)) {
        players[name] = {
          money: condition.money,
          position: 0,
          jailTurns: 0,
          propertyGroups: {},
          getOutOfJailCards: 0
        };
      }
  
      return {
        players,
        availableHouses: GAME_CONSTANTS.MAX_HOUSES,
        availableHotels: GAME_CONSTANTS.MAX_HOTELS,
        freeParkingMoney: 0,
        currentTurn: 1,
        currentPlayer: Object.keys(players)[0],
        winner: null,
        bankruptPlayers: []
      };
    }
  
    private assignInitialProperties(assignments: Record<string, string[]>) {
      // Validate all properties exist and aren't duplicated
      const allAssigned = new Set<string>();
      for (const [player, properties] of Object.entries(assignments)) {
        for (const propertyName of properties) {
          if (allAssigned.has(propertyName)) {
            throw new Error(`Property ${propertyName} assigned multiple times`);
          }
          if (!getProperty(propertyName)) {
            throw new Error(`Invalid property name: ${propertyName}`);
          }
          allAssigned.add(propertyName);
        }
      }
  
      // Assign properties and update player states
      for (const [playerName, propertyNames] of Object.entries(assignments)) {
        const player = this.state.players[playerName];
        if (!player) continue;
  
        // Group properties by their color/type
        const groupedProperties: Partial<Record<PropertyGroup, string[]>> = {};
        
        for (const propertyName of propertyNames) {
          const property = getProperty(propertyName)!;
          if (!groupedProperties[property.group]) {
            groupedProperties[property.group] = [];
          }
          groupedProperties[property.group]!.push(propertyName);
        }
  
        // Update player's property groups
        for (const [group, properties] of Object.entries(groupedProperties)) {
          player.propertyGroups[group as PropertyGroup] = {
            owned: properties,
            monopoly: properties.length === GROUP_SIZES[group as PropertyGroup],
            houses: Object.fromEntries(properties.map(p => [p, 0])),
            hotels: Object.fromEntries(properties.map(p => [p, 0])),
            mortgaged: Object.fromEntries(properties.map(p => [p, false]))
          };
        }
      }
    }
  
    private rollDice(): [number, number] {
      return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
    }
  
    private log(player: string, action: GameAction) {
      if (!this.debug) return;
      
      this.logs.push({
        turn: this.state.currentTurn,
        player,
        action,
        resultingState: structuredClone(this.state) // Deep copy for debugging
      });

      // look at rent patterns to make sure they make sense
      if (action.type === 'PAY_RENT') {
        console.log({
          turn: this.state.currentTurn,
          player,
          action,
        })
      }
    }
  
    private calculateRent(property: Property, diceRoll: number = 0): number {
      const owner = this.findPropertyOwner(property.name);
      if (!owner) return 0;
  
      const propertySet = owner.propertyGroups[property.group];
      if (!propertySet || propertySet.mortgaged[property.name]) return 0;
  
      // Handle utilities
      if (property.group === 'utility') {
        const multiplier = propertySet.monopoly ? 10 : 4;
        return diceRoll * multiplier;
      }
  
      // Handle railroads
      if (property.group === 'railroad') {
        const ownedCount = propertySet.owned.length;
        return property.baseRent * Math.pow(2, ownedCount - 1);
      }
  
      // Regular properties
      const propertyState = {
        houses: propertySet.houses[property.name] || 0,
        hotels: propertySet.hotels[property.name] || 0
      };
  
      if (propertyState.hotels > 0) {
        return property.hotelRent;
      }
      
      if (propertyState.houses > 0) {
        return property.houseRent[propertyState.houses - 1];
      }
  
      // Base rent, doubled if monopoly
      return property.baseRent * (propertySet.monopoly ? 2 : 1);
    }
  
    private findPropertyOwner(propertyName: string): PlayerState | null {
      for (const [_, player] of Object.entries(this.state.players)) {
        for (const group of Object.values(player.propertyGroups)) {
          if (group.owned.includes(propertyName)) {
            return player;
          }
        }
      }
      return null;
    }

    private attemptPayment(from: string, to: string | null, amount: number): boolean {
        const fromPlayer = this.state.players[from];
        if (!fromPlayer) return false;
      
        // If player has the money, simple transfer
        if (fromPlayer.money >= amount) {
          fromPlayer.money -= amount;
          if (to && this.state.players[to]) {
            this.state.players[to].money += amount;
          } else if (!to) {
            this.state.freeParkingMoney += amount;
          }
          return true;
        }
      
        // Player needs to raise money
        const needed = amount - fromPlayer.money;
        const raised = PlayerAI.raiseMoney(fromPlayer, needed, 0.5);
      
        // If they still can't pay after raising money, they go bankrupt
        if (fromPlayer.money + raised < amount) {
          this.handleBankruptcy(from, to);
          return false;
        }
      
        // They raised enough - make the payment
        fromPlayer.money = fromPlayer.money + raised - amount;
        if (to && this.state.players[to]) {
          this.state.players[to].money += amount;
        } else if (!to) {
          this.state.freeParkingMoney += amount;
        }
        return true;
      }
  
      private handleBankruptcy(player: string, beneficiary: string | null) {
        const bankruptPlayer = this.state.players[player];
        
        // Transfer properties and any remaining money to beneficiary
        if (beneficiary && this.state.players[beneficiary]) {
          const beneficiaryPlayer = this.state.players[beneficiary];
          
          // Transfer all properties
          for (const [group, propertySet] of Object.entries(bankruptPlayer.propertyGroups)) {
            if (!beneficiaryPlayer.propertyGroups[group as PropertyGroup]) {
              beneficiaryPlayer.propertyGroups[group as PropertyGroup] = {
                owned: [],
                monopoly: false,
                houses: {},
                hotels: {},
                mortgaged: {}
              };
            }
            
            beneficiaryPlayer.propertyGroups[group as PropertyGroup]!.owned.push(...propertySet.owned);
            Object.assign(beneficiaryPlayer.propertyGroups[group as PropertyGroup]!.houses, propertySet.houses);
            Object.assign(beneficiaryPlayer.propertyGroups[group as PropertyGroup]!.hotels, propertySet.hotels);
            Object.assign(beneficiaryPlayer.propertyGroups[group as PropertyGroup]!.mortgaged, propertySet.mortgaged);
          }
          
          // Transfer any remaining money
          if (bankruptPlayer.money > 0) {
            beneficiaryPlayer.money += bankruptPlayer.money;
          }
        }
      
        // Clear bankrupt player's state
        bankruptPlayer.money = 0;
        bankruptPlayer.propertyGroups = {};
        
        // Add to bankrupt list and check for game end
        this.state.bankruptPlayers.push(player);
        
        // Check for winner
        const remainingPlayers = Object.keys(this.state.players)
          .filter(p => !this.state.bankruptPlayers.includes(p));
        
        if (remainingPlayers.length === 1) {
          this.state.winner = remainingPlayers[0];
        }
      }
  
    public simulateTurn(): boolean {
      const player = this.state.currentPlayer;
      if (this.state.winner || !player) return false;
  
      const playerState = this.state.players[player];
      if (!playerState || this.state.bankruptPlayers.includes(player)) {
        this.nextPlayer();
        return true;
      }

       // Try to build houses
       if (!this.state.bankruptPlayers.includes(player)) {
        PlayerAI.buildHouses(playerState, this.state.availableHouses, 0);
      }
  
      // Roll dice
      const [die1, die2] = this.rollDice();
      const diceRoll = die1 + die2;
      this.log(player, { type: 'ROLL_DICE' });
  
      // Handle jail
      if (playerState.jailTurns > 0) {
        if (die1 === die2 || playerState.jailTurns === 3 || playerState.getOutOfJailCards > 0) {
          if (playerState.getOutOfJailCards > 0) {
            playerState.getOutOfJailCards--;
          } else if (playerState.jailTurns === 3) {
            this.attemptPayment(player, null, GAME_CONSTANTS.JAIL_FINE);
          }
          playerState.jailTurns = 0;
        } else {
          playerState.jailTurns++;
          this.nextPlayer();
          return true;
        }
      }
  
      // Move player
      playerState.position = (playerState.position + diceRoll) % BOARD_SPACES.length;
      
      // Handle passing GO
      if (playerState.position < diceRoll) {
        playerState.money += GAME_CONSTANTS.GO_SALARY;
        this.log(player, { type: 'COLLECT_GO' });
      }
      
      // Handle landing on space
      const space = BOARD_SPACES[playerState.position];
      const property = getProperty(space);
  
      if (property) {
        const owner = this.findPropertyOwner(property.name);
        if (owner && owner !== playerState) {
          // Pay rent
          const rent = this.calculateRent(property, diceRoll);
          this.attemptPayment(player, owner.money.toString(), rent);
          // todo: actually show the player and not like, what space they're on
          this.log(player, { type: 'PAY_RENT', amount: rent, to: owner.position.toString() });
        }
      } else {
        // Handle special spaces
        switch (space) {
          case 'Income Tax':
            const tax = Math.min(
              GAME_CONSTANTS.INCOME_TAX,
              Math.floor(playerState.money * GAME_CONSTANTS.INCOME_TAX_PERCENTAGE)
            );
            this.attemptPayment(player, null, tax);
            this.log(player, { type: 'PAY_TAX', amount: tax });
            break;
          case 'Luxury Tax':
            this.attemptPayment(player, null, GAME_CONSTANTS.LUXURY_TAX);
            this.log(player, { type: 'PAY_TAX', amount: GAME_CONSTANTS.LUXURY_TAX });
            break;
          case 'Go To Jail':
            playerState.position = BOARD_SPACES.indexOf('Jail');
            playerState.jailTurns = 1;
            this.log(player, { type: 'GO_TO_JAIL' });
            break;
        }
      }
  
      // If doubles were rolled, player goes again (unless they're now bankrupt)
      if (die1 === die2 && !this.state.bankruptPlayers.includes(player)) {
        return true;
      }
  
      this.nextPlayer();
      return true;
    }
  
    private nextPlayer() {
      const players = Object.keys(this.state.players);
      const currentIndex = players.indexOf(this.state.currentPlayer);
      let nextIndex = (currentIndex + 1) % players.length;
      
      // Skip bankrupt players
      while (this.state.bankruptPlayers.includes(players[nextIndex])) {
        nextIndex = (nextIndex + 1) % players.length;
        // If we've looped all the way around, everyone's bankrupt
        if (nextIndex === currentIndex) {
          this.state.winner = 'draw';
          return;
        }
      }
      
      this.state.currentPlayer = players[nextIndex];

      const firstAlivePlayer = Object.keys(this.state.players)
      .find(p => !this.state.bankruptPlayers.includes(p));
    
      if (firstAlivePlayer && nextIndex === Object.keys(this.state.players).indexOf(firstAlivePlayer)) {
        this.state.currentTurn++;
      }
    }
  
    public getState(): GameState {
      return structuredClone(this.state);
    }
  
    public getLogs(): GameLog[] {
      return this.debug ? structuredClone(this.logs) : [];
    }
  
    // Helper method to run a complete game
    public simulateToEnd(): GameState {
      while (!this.state.winner && this.state.currentTurn < GAME_CONSTANTS.MAX_TURNS) {
        this.simulateTurn();
      }
      return this.getState();
    }

    private getMortgageValue(property: Property): number {
      return Math.floor(property.price * GAME_CONSTANTS.MORTGAGE_RATE);
    }
    
    private getUnmortgageCost(property: Property): number {
      const mortgageValue = this.getMortgageValue(property);
      const fee = Math.ceil(mortgageValue * GAME_CONSTANTS.UNMORTGAGE_FEE);
      return mortgageValue + fee;
    }
    
    private validateHouseCount(propertySet: PropertySet): boolean {
      if (!propertySet.monopoly) return true;
      
      const houses = Object.values(propertySet.houses);
      const min = Math.min(...houses);
      const max = Math.max(...houses);
      return max - min <= 1;
    }
    
    private mortgageProperty(playerState: PlayerState, propertyName: string): number {
      const property = getProperty(propertyName);
      if (!property) return 0;
      
      const propertySet = playerState.propertyGroups[property.group];
      if (!propertySet || propertySet.mortgaged[propertyName]) return 0;
    
      // Can't mortgage if any properties in the group have houses
      if (Object.values(propertySet.houses).some(h => h > 0)) return 0;
    
      const mortgageValue = this.getMortgageValue(property);
      propertySet.mortgaged[propertyName] = true;
      playerState.money += mortgageValue;
    
      this.log(this.state.currentPlayer, {
        type: 'MORTGAGE_PROPERTY',
        property: propertyName
      });
    
      return mortgageValue;
    }
    
    private unmortgageProperty(playerState: PlayerState, propertyName: string): boolean {
      const property = getProperty(propertyName);
      if (!property) return false;
      
      const propertySet = playerState.propertyGroups[property.group];
      if (!propertySet || !propertySet.mortgaged[propertyName]) return false;
    
      const cost = this.getUnmortgageCost(property);
      if (playerState.money < cost) return false;
    
      propertySet.mortgaged[propertyName] = false;
      playerState.money -= cost;
    
      this.log(this.state.currentPlayer, {
        type: 'UNMORTGAGE_PROPERTY',
        property: propertyName
      });
    
      return true;
    }
    
    private sellHouse(propertySet: PropertySet, property: Property): number {
      const currentHouses = propertySet.houses[property.name] || 0;
      if (currentHouses === 0) return 0;
    
      // Temporarily remove one house
      propertySet.houses[property.name]--;
    
      // Check if this would make house counts uneven
      if (!this.validateHouseCount(propertySet)) {
        propertySet.houses[property.name]++;
        return 0;
      }
    
      this.state.availableHouses++;
      return Math.floor(property.houseCost / 2);
    }
  }