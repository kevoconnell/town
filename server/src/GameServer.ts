import { WebSocketServer, WebSocket } from 'ws';
import {
  PlayerState,
  NetworkMessage,
  MessageType,
  GameState,
  BuildingLocation,
  BuildingType,
  GAME_CONFIG,
  NETWORK_CONFIG,
  STARTING_STATS,
  WORLD_BOUNDS,
  generateId,
  clamp,
  ActionType,
  generateSpawnPosition,
} from '@my-town/shared';

export class GameServer {
  private clients: Map<WebSocket, string> = new Map();
  private players: Map<string, PlayerState> = new Map();
  private buildings: BuildingLocation[] = [];
  private gameLoopInterval?: NodeJS.Timeout;

  constructor(private wss: WebSocketServer) {
    this.initializeWorld();
    this.setupWebSocket();
    this.startGameLoop();
  }

  private initializeWorld() {
    // Create town buildings
    this.buildings = [
      {
        id: 'well-1',
        type: BuildingType.WELL,
        position: { x: -20, y: 0, z: -20 },
        name: 'Town Well',
      },
      {
        id: 'market-1',
        type: BuildingType.MARKET,
        position: { x: 30, y: 0, z: -10 },
        name: 'Market Square',
      },
      {
        id: 'farm-1',
        type: BuildingType.FARM,
        position: { x: -40, y: 0, z: 30 },
        name: 'Community Farm',
      },
      {
        id: 'tavern-1',
        type: BuildingType.TAVERN,
        position: { x: 0, y: 0, z: 0 },
        name: 'The Rusty Tankard',
      },
    ];
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected');

      const playerId = generateId();
      this.clients.set(ws, playerId);

      // Generate random spawn position
      const spawnPoint = generateSpawnPosition(this.buildings);

      // Create new player
      const player: PlayerState = {
        id: playerId,
        name: `Player ${this.players.size + 1}`,
        position: spawnPoint.position,
        rotation: spawnPoint.rotation,
        stats: { ...STARTING_STATS },
        inventory: [],
      };

      this.players.set(playerId, player);

      // Send initial game state to new player
      this.sendToClient(ws, {
        type: MessageType.CONNECT,
        data: {
          playerId,
          player,
          buildings: this.buildings,
        },
        timestamp: Date.now(),
      });

      // Broadcast new player to all clients
      this.broadcast({
        type: MessageType.PLAYER_UPDATE,
        data: player,
        timestamp: Date.now(),
      });

      // Handle messages from client
      ws.on('message', (data: string) => {
        try {
          const message: NetworkMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        console.log('Client disconnected');
        const playerId = this.clients.get(ws);
        if (playerId) {
          this.players.delete(playerId);
          this.clients.delete(ws);

          this.broadcast({
            type: MessageType.DISCONNECT,
            data: { playerId },
            timestamp: Date.now(),
          });
        }
      });
    });
  }

  private handleMessage(ws: WebSocket, message: NetworkMessage) {
    const playerId = this.clients.get(ws);
    if (!playerId) return;

    const player = this.players.get(playerId);
    if (!player) return;

    switch (message.type) {
      case MessageType.PLAYER_UPDATE:
        // Update player position and rotation
        if (message.data.position) {
          // Apply world boundaries - clamp position to valid range
          player.position = {
            x: clamp(message.data.position.x, WORLD_BOUNDS.MIN_X, WORLD_BOUNDS.MAX_X),
            y: message.data.position.y,
            z: clamp(message.data.position.z, WORLD_BOUNDS.MIN_Z, WORLD_BOUNDS.MAX_Z),
          };
        }
        if (message.data.rotation !== undefined) {
          player.rotation = message.data.rotation;
        }
        // Broadcast to all clients
        this.broadcast({
          type: MessageType.PLAYER_UPDATE,
          data: player,
          timestamp: Date.now(),
        });
        break;

      case MessageType.ACTION:
        this.handleAction(playerId, message.data);
        break;

      case MessageType.CHAT:
        this.broadcast({
          type: MessageType.CHAT,
          data: {
            playerId,
            playerName: player.name,
            message: message.data.message,
          },
          timestamp: Date.now(),
        });
        break;
    }
  }

  private handleAction(playerId: string, action: any) {
    const player = this.players.get(playerId);
    if (!player) return;

    switch (action.type) {
      case ActionType.GATHER_WATER:
        if (player.stats.energy >= GAME_CONFIG.GATHER_ENERGY_COST) {
          player.stats.thirst = Math.min(100, player.stats.thirst + GAME_CONFIG.WATER_RESTORE);
          player.stats.energy -= GAME_CONFIG.GATHER_ENERGY_COST;
        }
        break;

      case ActionType.GATHER_FOOD:
        if (player.stats.energy >= GAME_CONFIG.GATHER_ENERGY_COST) {
          player.stats.hunger = Math.min(100, player.stats.hunger + GAME_CONFIG.FOOD_RESTORE);
          player.stats.energy -= GAME_CONFIG.GATHER_ENERGY_COST;
        }
        break;

      case ActionType.REST:
        player.stats.energy = Math.min(100, player.stats.energy + GAME_CONFIG.REST_RESTORE);
        break;
    }

    this.broadcast({
      type: MessageType.PLAYER_UPDATE,
      data: player,
      timestamp: Date.now(),
    });
  }

  private startGameLoop() {
    const tickRate = 1000 / NETWORK_CONFIG.TICK_RATE;

    this.gameLoopInterval = setInterval(() => {
      this.updateGameState(tickRate / 1000);
    }, tickRate);
  }

  private updateGameState(deltaTime: number) {
    // Update all players' survival stats
    for (const player of this.players.values()) {
      player.stats.hunger = clamp(
        player.stats.hunger - GAME_CONFIG.HUNGER_DECAY_RATE * deltaTime,
        0,
        100
      );
      player.stats.thirst = clamp(
        player.stats.thirst - GAME_CONFIG.THIRST_DECAY_RATE * deltaTime,
        0,
        100
      );
      player.stats.energy = clamp(
        player.stats.energy - GAME_CONFIG.ENERGY_DECAY_RATE * deltaTime,
        0,
        100
      );

      // Health decreases if hunger or thirst is too low
      if (player.stats.hunger < 20 || player.stats.thirst < 20) {
        player.stats.health = clamp(player.stats.health - 1 * deltaTime, 0, 100);
      } else if (player.stats.health < 100) {
        player.stats.health = clamp(player.stats.health + 0.5 * deltaTime, 0, 100);
      }
    }

    // Send game state update to all clients periodically
    if (Date.now() % 1000 < 100) {
      this.broadcastGameState();
    }
  }

  private broadcastGameState() {
    const gameState = {
      players: Array.from(this.players.values()),
      buildings: this.buildings,
      timeOfDay: (Date.now() / 1000 / GAME_CONFIG.DAY_LENGTH_SECONDS) % 24,
    };

    this.broadcast({
      type: MessageType.GAME_STATE,
      data: gameState,
      timestamp: Date.now(),
    });
  }

  private sendToClient(ws: WebSocket, message: NetworkMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcast(message: NetworkMessage) {
    const data = JSON.stringify(message);
    for (const client of this.clients.keys()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  public shutdown() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
    }
    this.wss.close();
  }
}
