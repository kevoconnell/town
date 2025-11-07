# Architecture Overview

## Project Structure

```
my-town-scaffold/
├── client/              # Browser-based 3D game client
│   ├── src/
│   │   ├── main.ts                 # Entry point
│   │   ├── GameClient.ts           # Main game loop and coordination
│   │   ├── SceneManager.ts         # Three.js scene management
│   │   ├── NetworkManager.ts       # WebSocket client
│   │   ├── PlayerController.ts     # Input handling and movement
│   │   └── UIManager.ts            # UI state management
│   ├── index.html                  # HTML entry point
│   └── package.json
│
├── server/              # Node.js multiplayer server
│   ├── src/
│   │   ├── index.ts                # Server entry point
│   │   └── GameServer.ts           # Game state and WebSocket server
│   └── package.json
│
└── shared/              # Shared types and logic
    ├── src/
    │   ├── types.ts                # TypeScript interfaces
    │   ├── constants.ts            # Game balance constants
    │   └── utils.ts                # Shared utilities
    └── package.json
```

## Technology Stack

### Client
- **Next.js 14**: React framework with App Router
- **React 18**: UI component library
- **React Three Fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for R3F
- **Jotai**: Atomic state management
- **TypeScript**: Type-safe JavaScript
- **WebSocket**: Real-time communication

### Server
- **Node.js**: JavaScript runtime
- **Express**: HTTP server
- **ws**: WebSocket library
- **TypeScript**: Type-safe JavaScript

### Shared
- **TypeScript**: Shared types between client and server

## Game Systems

### 1. Survival System
Players have four stats that decay over time:
- **Hunger**: Decreases gradually, restored by eating
- **Thirst**: Decreases faster than hunger, restored by drinking
- **Energy**: Decreases slowly, restored by resting
- **Health**: Decreases when hunger/thirst are critical, regenerates when needs are met

### 2. Movement System
- WASD controls for movement
- Mouse look for camera control
- Collision detection with town boundaries
- First-person perspective

### 3. Action System
Players can perform actions at specific locations:
- **Gather Water**: Visit the well (E key)
- **Gather Food**: Visit the farm (F key)
- **Rest**: Visit the tavern (R key)
- **Trade**: Visit the market (planned)

### 4. Multiplayer System
- Real-time player synchronization
- Server-authoritative game state
- Client-side prediction for smooth movement
- 20 tick/second server update rate

## Network Protocol

### Message Types
1. **CONNECT**: Initial connection, receive player ID and game state
2. **DISCONNECT**: Player leaves the game
3. **PLAYER_UPDATE**: Position and rotation updates
4. **GAME_STATE**: Full game state snapshot
5. **ACTION**: Player performs an action
6. **CHAT**: Player sends a message (planned)

### Data Flow
```
Client                          Server
  |                               |
  |--- CONNECT ------------------>|
  |<-- CONNECT (player data) -----|
  |                               |
  |--- PLAYER_UPDATE (position) ->|
  |                               |
  |<-- GAME_STATE (all players) --|
  |                               |
  |--- ACTION (drink water) ----->|
  |<-- PLAYER_UPDATE (new stats) -|
```

## Extending the Game

### Adding New Buildings
1. Add building type to `BuildingType` enum in `shared/src/types.ts`
2. Add building to world initialization in `server/src/GameServer.ts`
3. Add visual representation in `client/src/SceneManager.ts`

### Adding New Actions
1. Add action type to `ActionType` enum in `shared/src/types.ts`
2. Implement action handler in `server/src/GameServer.ts`
3. Add UI button in `client/index.html`
4. Connect button to action in `client/src/GameClient.ts`

### Adding New Stats
1. Add stat to `SurvivalStats` interface in `shared/src/types.ts`
2. Add decay logic in `server/src/GameServer.ts`
3. Add UI bar in `client/index.html`
4. Add update logic in `client/src/UIManager.ts`

## Performance Considerations

- **Client**: Targets 60 FPS, uses Three.js optimizations
- **Server**: 20 tick/second update rate, efficient state management
- **Network**: Delta compression for position updates (planned)
- **Rendering**: Frustum culling, LOD for distant objects (planned)

## Future Enhancements

1. **Inventory System**: Collect and store items
2. **Trading System**: Exchange items with NPCs or players
3. **Day/Night Cycle**: Visual changes and gameplay effects
4. **Weather System**: Rain, snow, etc.
5. **Quests**: Structured objectives for players
6. **Persistence**: Save player progress to database
7. **Voice Chat**: Real-time voice communication
8. **Mobile Support**: Touch controls for mobile devices
