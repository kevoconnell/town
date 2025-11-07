'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import {
  connectedAtom,
  localStatsAtom,
  playersArrayAtom,
  playerIdAtom,
  buildingsAtom,
  localPositionAtom,
} from '@/stores/gameAtoms';
import {
  ActionType,
  NetworkMessage,
  MessageType,
  BuildingType,
  GAME_CONFIG,
  distance,
} from '@my-town/shared';
import styles from './UI.module.css';

export default function UI() {
  const connected = useAtomValue(connectedAtom);
  const localStats = useAtomValue(localStatsAtom);
  const players = useAtomValue(playersArrayAtom);
  const playerId = useAtomValue(playerIdAtom);
  const buildings = useAtomValue(buildingsAtom);
  const localPosition = useAtomValue(localPositionAtom);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Access the WebSocket from window (we'll set it in NetworkManager)
    const checkWs = setInterval(() => {
      if ((window as any).gameWs) {
        wsRef.current = (window as any).gameWs;
        clearInterval(checkWs);
      }
    }, 100);

    return () => clearInterval(checkWs);
  }, []);

  const sendAction = (actionType: ActionType) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && playerId) {
      const message: NetworkMessage = {
        type: MessageType.ACTION,
        data: {
          type: actionType,
          playerId,
        },
        timestamp: Date.now(),
      };
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case 'e':
        sendAction(ActionType.GATHER_WATER);
        break;
      case 'f':
        sendAction(ActionType.GATHER_FOOD);
        break;
      case 'r':
        sendAction(ActionType.REST);
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerId]);

  const getHealthIndicator = (health: number) => {
    if (health > 75) return '💚';
    if (health > 50) return '💛';
    if (health > 25) return '🧡';
    return '❤️';
  };

  // Calculate proximity to buildings
  const nearbyBuildings = useMemo(() => {
    return {
      well: buildings.some(
        (b) =>
          b.type === BuildingType.WELL &&
          distance(localPosition, b.position) <= GAME_CONFIG.INTERACTION_RADIUS
      ),
      farm: buildings.some(
        (b) =>
          b.type === BuildingType.FARM &&
          distance(localPosition, b.position) <= GAME_CONFIG.INTERACTION_RADIUS
      ),
      tavern: buildings.some(
        (b) =>
          b.type === BuildingType.TAVERN &&
          distance(localPosition, b.position) <= GAME_CONFIG.INTERACTION_RADIUS
      ),
    };
  }, [buildings, localPosition]);

  return (
    <div className={styles.uiOverlay}>
      {/* Connection Status */}
      <div className={`${styles.connectionStatus} ${connected ? styles.connected : styles.disconnected}`}>
        {connected ? 'Connected' : 'Disconnected'}
      </div>

      {/* Stats Panel */}
      {localStats && (
        <div className={styles.statsPanel}>
          <h3>Survival Stats</h3>
          <div className={styles.statBar}>
            <div className={styles.statLabel}>Hunger</div>
            <div className={styles.bar}>
              <div
                className={`${styles.barFill} ${styles.hunger}`}
                style={{ width: `${Math.max(0, localStats.hunger)}%` }}
              />
            </div>
          </div>
          <div className={styles.statBar}>
            <div className={styles.statLabel}>Thirst</div>
            <div className={styles.bar}>
              <div
                className={`${styles.barFill} ${styles.thirst}`}
                style={{ width: `${Math.max(0, localStats.thirst)}%` }}
              />
            </div>
          </div>
          <div className={styles.statBar}>
            <div className={styles.statLabel}>Energy</div>
            <div className={styles.bar}>
              <div
                className={`${styles.barFill} ${styles.energy}`}
                style={{ width: `${Math.max(0, localStats.energy)}%` }}
              />
            </div>
          </div>
          <div className={styles.statBar}>
            <div className={styles.statLabel}>Health</div>
            <div className={styles.bar}>
              <div
                className={`${styles.barFill} ${styles.health}`}
                style={{ width: `${Math.max(0, localStats.health)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Prompts */}
      {nearbyBuildings.well && (
        <div className={styles.actionPrompt}>
          Press [E] to Drink Water at Well
        </div>
      )}
      {nearbyBuildings.farm && (
        <div className={styles.actionPrompt}>
          Press [F] to Gather Food at Farm
        </div>
      )}
      {nearbyBuildings.tavern && (
        <div className={styles.actionPrompt}>
          Press [R] to Rest at Tavern
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actionsPanel}>
        <button
          className={styles.actionBtn}
          onClick={() => sendAction(ActionType.GATHER_WATER)}
          disabled={!nearbyBuildings.well}
          style={{ opacity: nearbyBuildings.well ? 1 : 0.5 }}
        >
          Drink Water [E]
        </button>
        <button
          className={styles.actionBtn}
          onClick={() => sendAction(ActionType.GATHER_FOOD)}
          disabled={!nearbyBuildings.farm}
          style={{ opacity: nearbyBuildings.farm ? 1 : 0.5 }}
        >
          Eat Food [F]
        </button>
        <button
          className={styles.actionBtn}
          onClick={() => sendAction(ActionType.REST)}
          disabled={!nearbyBuildings.tavern}
          style={{ opacity: nearbyBuildings.tavern ? 1 : 0.5 }}
        >
          Rest [R]
        </button>
      </div>

      {/* Controls Help */}
      <div className={styles.controlsHelp}>
        <h4>Controls</h4>
        <div>
          <div>WASD - Move</div>
          <div>Mouse - Look Around</div>
          <div>E - Drink Water</div>
          <div>F - Eat Food</div>
          <div>R - Rest</div>
          <div>Click to lock pointer</div>
        </div>
      </div>

      {/* Players List */}
      <div className={styles.playersList}>
        <h4>Online Players ({players.length})</h4>
        <div className={styles.playersContainer}>
          {players.map((player) => (
            <div key={player.id} className={styles.playerItem}>
              {player.name} {getHealthIndicator(player.stats.health)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
