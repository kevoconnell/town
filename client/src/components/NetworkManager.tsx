'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useSetAtom } from 'jotai';
import {
  playerIdAtom,
  connectedAtom,
  updatePlayerAtom,
  removePlayerAtom,
  buildingsAtom,
  localPositionAtom,
} from '@/stores/gameAtoms';
import { NetworkMessage, MessageType, NETWORK_CONFIG } from '@my-town/shared';

export default function NetworkManager() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const { camera } = useThree();

  const setPlayerId = useSetAtom(playerIdAtom);
  const setConnected = useSetAtom(connectedAtom);
  const updatePlayer = useSetAtom(updatePlayerAtom);
  const removePlayer = useSetAtom(removePlayerAtom);
  const setBuildings = useSetAtom(buildingsAtom);
  const setLocalPosition = useSetAtom(localPositionAtom);

  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:${NETWORK_CONFIG.SERVER_PORT}`;

    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        // Expose to window for UI component
        (window as any).gameWs = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnected(true);
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event) => {
          const message: NetworkMessage = JSON.parse(event.data);
          handleMessage(message);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setConnected(false);

          // Attempt to reconnect
          if (reconnectAttemptsRef.current < 5) {
            reconnectAttemptsRef.current++;
            console.log(`Reconnecting... (${reconnectAttemptsRef.current}/5)`);
            setTimeout(connect, 2000);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    };

    const handleMessage = (message: NetworkMessage) => {
      switch (message.type) {
        case MessageType.CONNECT:
          setPlayerId(message.data.playerId);
          setBuildings(message.data.buildings || []);
          console.log('Connected with ID:', message.data.playerId);
          break;

        case MessageType.PLAYER_UPDATE:
          updatePlayer(message.data);
          break;

        case MessageType.GAME_STATE:
          message.data.players.forEach((player: any) => {
            updatePlayer(player);
          });
          break;

        case MessageType.DISCONNECT:
          removePlayer(message.data.playerId);
          break;
      }
    };

    connect();

    // Send position updates
    const intervalId = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const position = {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        };
        setLocalPosition(position);

        const message: NetworkMessage = {
          type: MessageType.PLAYER_UPDATE,
          data: {
            position,
            rotation: camera.rotation.y,
          },
          timestamp: Date.now(),
        };
        wsRef.current.send(JSON.stringify(message));
      }
    }, 50); // 20 updates per second

    return () => {
      clearInterval(intervalId);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [camera, setPlayerId, setConnected, updatePlayer, removePlayer, setBuildings, setLocalPosition]);

  return null;
}
