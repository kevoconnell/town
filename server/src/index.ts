import express from 'express';
import { WebSocketServer } from 'ws';
import { GameServer } from './GameServer.js';
import { NETWORK_CONFIG } from '@my-town/shared';

const app = express();
const PORT = process.env.PORT || NETWORK_CONFIG.SERVER_PORT;

// Serve static files in production
app.use(express.static('public'));

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Initialize game server
const gameServer = new GameServer(wss);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  gameServer.shutdown();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
