'use client';

import { useEffect, useRef } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import {
  playerIdAtom,
  connectionStatusAtom,
  updatePlayerAtom,
  removePlayerAtom,
  buildingsAtom,
  localPositionAtom,
  localRotationAtom,
} from '@/stores/gameAtoms';
import { NetworkMessage, MessageType, NETWORK_CONFIG } from '@my-town/shared';

interface NetworkManagerProps {
  playerName: string;
}

export default function NetworkManager({ playerName }: NetworkManagerProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const playerNameRef = useRef(playerName);
  const positionRef = useRef({ x: 0, y: 0, z: 0 });
  const rotationRef = useRef(0);

  const setPlayerId = useSetAtom(playerIdAtom);
  const setConnectionStatus = useSetAtom(connectionStatusAtom);
  const updatePlayer = useSetAtom(updatePlayerAtom);
  const removePlayer = useSetAtom(removePlayerAtom);
  const setBuildings = useSetAtom(buildingsAtom);
  const localPosition = useAtomValue(localPositionAtom);
  const localRotation = useAtomValue(localRotationAtom);

  // Update refs when position/rotation changes
  useEffect(() => {
    positionRef.current = localPosition;
  }, [localPosition]);

  useEffect(() => {
    rotationRef.current = localRotation;
  }, [localRotation]);

  // Update ref when playerName changes
  useEffect(() => {
    playerNameRef.current = playerName;
  }, [playerName]);

  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:${NETWORK_CONFIG.SERVER_PORT}`;

    const connect = () => {
      try {
        setConnectionStatus('connecting');
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        // Expose to window for UI component
        (window as any).gameWs = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnectionStatus('connected');
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event) => {
          const message: NetworkMessage = JSON.parse(event.data);
          handleMessage(message);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setConnectionStatus('disconnected');

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
        setConnectionStatus('disconnected');
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

        case MessageType.PLAYER_DEATH:
          console.log(`${message.data.playerName} has died`);
          break;

        case MessageType.PLAYER_RESPAWN:
          updatePlayer(message.data.player);
          console.log(`${message.data.player.name} has respawned`);
          break;
      }
    };

    connect();

    // Send position updates
    const intervalId = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const message: NetworkMessage = {
          type: MessageType.PLAYER_UPDATE,
          data: {
            position: positionRef.current,
            rotation: rotationRef.current,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return null;
}
