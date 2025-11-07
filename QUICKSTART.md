# Quick Start Guide

## Installation

1. Install dependencies:
```bash
npm install
```

This will install all dependencies for client, server, and shared packages using npm workspaces.

## Development

### Start both client and server:
```bash
npm run dev
```

This will start:
- Client at http://localhost:3001 (Next.js dev server)
- Server at ws://localhost:3000 (WebSocket + HTTP server)

### Start individually:

```bash
# Start only the server
npm run dev:server

# Start only the client (in another terminal)
npm run dev:client
```

## Playing the Game

1. Open http://localhost:3001 in your browser
2. Click on the canvas to lock the pointer
3. Use controls to play:
   - **WASD**: Move around
   - **Mouse**: Look around
   - **E**: Drink water (when near well)
   - **F**: Eat food (when near farm)
   - **R**: Rest (when near tavern)
   - **Shift**: Run (hold while moving)

## Multiplayer Testing

Open multiple browser tabs/windows to http://localhost:3001 to see multiplayer in action. Each tab represents a different player.

## Game Mechanics

### Survival Stats
Your character has four stats that you need to manage:
- **Hunger** (red bar): Eat food to restore
- **Thirst** (blue bar): Drink water to restore
- **Energy** (yellow bar): Rest to restore
- **Health** (green bar): Decreases if hunger/thirst are too low

### Buildings
- **Town Well** (gray cylinder): Gather water here
- **Community Farm** (brown building): Gather food here
- **The Rusty Tankard** (red building): Rest here
- **Market Square** (orange building): Trading (coming soon)

### Tips
- Keep all your stats above 20% to maintain health
- Energy is consumed when gathering resources
- Stats decay over time, so stay active
- Explore the town and find all buildings
- Watch other players in the player list (bottom right)

## Building for Production

```bash
npm run build
```

This creates optimized builds in:
- `client/dist/` - Static files for hosting
- `server/dist/` - Compiled server code

## Starting Production Server

```bash
npm start
```

Make sure to serve the client build files from the server's public directory.

## Troubleshooting

### Port already in use
If port 3000 is already in use, you can change them:
- Server port: Edit `NETWORK_CONFIG.SERVER_PORT` in `shared/src/constants.ts`
- Client port: Set `PORT` environment variable or edit Next.js config

### WebSocket connection fails
- Ensure the server is running
- Check that the WebSocket URL in `client/src/GameClient.ts` matches your server configuration
- Check browser console for error messages

### Client can't connect
- Verify both client and server are running
- Check that firewall isn't blocking connections
- Try accessing from http://localhost:5173 instead of 127.0.0.1

## Next Steps

1. Read `ARCHITECTURE.md` to understand the codebase
2. Explore the code in `client/src/` and `server/src/`
3. Try modifying game constants in `shared/src/constants.ts`
4. Add new buildings or actions following the patterns
5. Experiment with React Three Fiber in `client/src/components/Scene.tsx`
6. Learn about React Three Fiber at https://docs.pmnd.rs/react-three-fiber

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Documentation](https://threejs.org/docs/)
- [Jotai Documentation](https://jotai.org)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
