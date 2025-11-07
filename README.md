note: I am using this repo to learn about git worktrees with claude code - this code will most likely not be good at all :)

# My Town - 3D Multiplayer Survival Game

A browser-based 3D survival game where players manage resources, trade, and survive in a multiplayer town environment.

## Features

- 3D graphics powered by Three.js
- Real-time multiplayer with WebSocket
- Survival mechanics (hunger, thirst)
- Resource gathering and trading
- Town exploration

## Tech Stack

- **Client**: Next.js, React, React Three Fiber, TypeScript, Jotai
- **Server**: Node.js, WebSocket, Express
- **Shared**: Common types and game logic

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

This will start both the client (http://localhost:3001) and server (ws://localhost:3000).

### Build
```bash
npm run build
```

## Project Structure

```
my-town-scaffold/
├── client/          # Next.js client (React + React Three Fiber)
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # React components
│   │   └── stores/        # Jotai state management
├── server/          # Game server (Node.js + WebSocket)
├── shared/          # Shared types and logic
└── package.json     # Root workspace config
```

## Game Mechanics

- **Survival Stats**: Hunger, thirst, energy
- **Actions**: Gather water, find food, trade with NPCs
- **Multiplayer**: See other players in real-time
- **Town**: Explore buildings and locations
