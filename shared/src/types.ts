// Player types
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface PlayerState {
  id: string;
  name: string;
  position: Vector3;
  rotation: number;
  stats: SurvivalStats;
  inventory: InventoryItem[];
  isDead: boolean;
}

export interface SurvivalStats {
  hunger: number;      // 0-100
  thirst: number;      // 0-100
  energy: number;      // 0-100
  health: number;      // 0-100
}

export interface InventoryItem {
  id: string;
  type: ItemType;
  quantity: number;
}

export enum ItemType {
  FOOD = 'food',
  WATER = 'water',
  WOOD = 'wood',
  STONE = 'stone',
  COIN = 'coin',
}

// Game actions
export enum ActionType {
  GATHER_WATER = 'gather_water',
  GATHER_FOOD = 'gather_food',
  TRADE = 'trade',
  REST = 'rest',
  MOVE = 'move',
}

export interface GameAction {
  type: ActionType;
  playerId: string;
  targetId?: string;
  data?: any;
}

// Network messages
export enum MessageType {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  SET_NAME = 'set_name',
  PLAYER_UPDATE = 'player_update',
  GAME_STATE = 'game_state',
  ACTION = 'action',
  CHAT = 'chat',
  PLAYER_DEATH = 'player_death',
  PLAYER_RESPAWN = 'player_respawn',
}

export interface NetworkMessage {
  type: MessageType;
  data: any;
  timestamp: number;
}

// World types
export interface BuildingLocation {
  id: string;
  type: BuildingType;
  position: Vector3;
  name: string;
}

export enum BuildingType {
  WELL = 'well',
  MARKET = 'market',
  HOUSE = 'house',
  FARM = 'farm',
  TAVERN = 'tavern',
}

export interface GameState {
  players: Map<string, PlayerState>;
  buildings: BuildingLocation[];
  timeOfDay: number; // 0-24
}
