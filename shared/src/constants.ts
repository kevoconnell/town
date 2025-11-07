// Game balance constants
export const GAME_CONFIG = {
  // Survival decay rates per second
  HUNGER_DECAY_RATE: 0.05,
  THIRST_DECAY_RATE: 0.08,
  ENERGY_DECAY_RATE: 0.03,

  // Recovery rates
  FOOD_RESTORE: 30,
  WATER_RESTORE: 40,
  REST_RESTORE: 25,

  // Action costs
  GATHER_ENERGY_COST: 5,
  TRADE_ENERGY_COST: 2,

  // Movement
  PLAYER_MOVE_SPEED: 5,
  RUN_SPEED_MULTIPLIER: 1.5,

  // World
  TOWN_SIZE: 200,
  DAY_LENGTH_SECONDS: 600, // 10 minutes = 1 day
  INTERACTION_RADIUS: 10, // Distance to interact with buildings

  // Death and Respawn
  RESPAWN_DELAY_SECONDS: 5,
};

// Starting stats
export const STARTING_STATS = {
  hunger: 100,
  thirst: 100,
  energy: 100,
  health: 100,
};

// World Boundaries
export const WORLD_BOUNDS = {
  MIN_X: -100,
  MAX_X: 100,
  MIN_Z: -100,
  MAX_Z: 100,
};

// Interaction
export const INTERACTION_RADIUS = 8;

// Network
export const NETWORK_CONFIG = {
  SERVER_PORT: 3000,
  TICK_RATE: 20, // Server updates per second
  CLIENT_UPDATE_RATE: 60, // Client render FPS target
};

// World bounds
export const WORLD_BOUNDS = {
  MIN_X: -GAME_CONFIG.TOWN_SIZE / 2,
  MAX_X: GAME_CONFIG.TOWN_SIZE / 2,
  MIN_Z: -GAME_CONFIG.TOWN_SIZE / 2,
  MAX_Z: GAME_CONFIG.TOWN_SIZE / 2,
};
