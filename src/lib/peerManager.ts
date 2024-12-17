// src/lib/peerManager.ts
import Peer, { DataConnection } from 'peerjs';

export type GameMessage = 
  | { type: 'GAME_START'; settings: { simultaneousMode: boolean } }
  | { type: 'GAME_STATE'; state: any }
  | { type: 'PLAYER_JOIN'; name: string }
  | { type: 'PLAYER_LIST'; players: string[] }
  | { type: 'BID'; amount: number; player: string }
  | { type: 'PASS'; player: string }
  | { type: 'SIMULATION_RESULTS'; results: any };

export class PeerManager {
  private peer: Peer;
  private connections: Map<string, DataConnection> = new Map();
  private isHost: boolean = false;
  private messageHandlers: ((msg: GameMessage) => void)[] = [];
  private connectedPlayers: Set<string> = new Set();
  public myName: string = '';

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('PeerManager can only be initialized in browser environment');
    }

    const peerId = Math.random().toString(36).substr(2, 9);
    this.peer = new Peer(peerId);

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    this.peer.on('disconnected', () => {
      console.log('Peer disconnected. Attempting to reconnect...');
      this.peer.reconnect();
    });

    this.peer.on('connection', (conn) => {
      console.log('Received connection from peer:', conn.peer);
      this.setupConnection(conn);
    });
  }

  public setMyName(name: string) {
    this.myName = name;
    if (this.isHost) {
      this.connectedPlayers.add(name);
      this.broadcastPlayerList();
    }
  }

  private broadcastPlayerList() {
    if (!this.isHost) return;
    console.log('Broadcasting player list:', Array.from(this.connectedPlayers));
    this.broadcast({ 
      type: 'PLAYER_LIST', 
      players: Array.from(this.connectedPlayers) 
    });
  }

  public async hostGame(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.isHost = true;
      if (this.myName) {
        this.connectedPlayers.add(this.myName);
      }

      if (this.peer.id) {
        resolve(this.peer.id);
      } else {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for peer ID'));
        }, 10000);

        this.peer.on('open', (id) => {
          clearTimeout(timeout);
          resolve(id);
        });
      }
    });
  }

  public async joinGame(roomCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const conn = this.peer.connect(roomCode, { reliable: true });
      
      const timeout = setTimeout(() => {
        conn.close();
        reject(new Error('Connection timeout'));
      }, 10000);

      conn.on('open', () => {
        clearTimeout(timeout);
        this.setupConnection(conn);
        if (this.myName) {
          conn.send({ type: 'PLAYER_JOIN', name: this.myName });
        }
        resolve();
      });

      conn.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  private setupConnection(conn: DataConnection) {
    this.connections.set(conn.peer, conn);

    conn.on('data', (data: unknown) => {
      if (this.isValidGameMessage(data)) {
        console.log('Received message:', data);
        
        if (data.type === 'PLAYER_JOIN') {
          if (this.isHost) {
            if (!this.connectedPlayers.has(data.name)) {
              this.connectedPlayers.add(data.name);
              this.broadcastPlayerList();
            }
          }
        } else if (data.type === 'PLAYER_LIST') {
          if (!this.isHost) {
            this.connectedPlayers = new Set(data.players);
          }
        }

        // Notify message handlers
        this.messageHandlers.forEach(handler => handler(data));
      }
    });

    conn.on('close', () => {
      console.log('Connection closed:', conn.peer);
      this.connections.delete(conn.peer);
    });
  }

  public getConnectedPlayers(): string[] {
    return Array.from(this.connectedPlayers);
  }

  public onMessage(handler: (msg: GameMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  public broadcast(message: GameMessage): void {
    console.log('Broadcasting message:', message);
    this.connections.forEach(conn => {
      try {
        conn.send(message);
      } catch (err) {
        console.error('Failed to send message to peer:', err);
      }
    });

    // Also handle the message locally if we're the host
    if (this.isHost) {
      this.messageHandlers.forEach(handler => handler(message));
    }
  }

  public close(): void {
    this.connections.forEach(conn => conn.close());
    this.connections.clear();
    this.connectedPlayers.clear();
    this.messageHandlers = [];
    this.peer.destroy();
  }

  private isValidGameMessage(msg: unknown): msg is GameMessage {
    if (!msg || typeof msg !== 'object' || !('type' in msg)) return false;
    
    const msgObj = msg as any;
    switch (msgObj.type) {
      case 'GAME_START':
        return true;
      case 'GAME_STATE':
        return 'state' in msgObj;
      case 'PLAYER_JOIN':
        return typeof msgObj.name === 'string';
      case 'PLAYER_LIST':
        return Array.isArray(msgObj.players);
      case 'BID':
        return typeof msgObj.amount === 'number' && typeof msgObj.player === 'string';
      case 'PASS':
        return typeof msgObj.player === 'string';
      case 'SIMULATION_RESULTS':
        return 'results' in msgObj;
      default:
        return false;
    }
  }
}