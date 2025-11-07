'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  connectionStatusAtom,
  localStatsAtom,
  playersArrayAtom,
  playerIdAtom,
  isDeadAtom,
  showTutorialAtom,
  localPositionAtom,
} from '@/stores/gameAtoms';
import { ActionType, NetworkMessage, MessageType, GAME_CONFIG, BuildingType, Vector3 } from '@my-town/shared';
import styles from './UI.module.css';
import Tutorial from './Tutorial';

// Building positions (same as in Buildings.tsx)
const BUILDINGS = [
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

// Helper function to calculate distance
function distance(pos1: Vector3, pos2: Vector3): number {
  const dx = pos1.x - pos2.x;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dz * dz);
}

// Helper functions for UI
function getStatIcon(stat: string): string {
  switch (stat) {
    case 'hunger':
      return '🍖';
    case 'thirst':
      return '💧';
    case 'energy':
      return '⚡';
    case 'health':
      return '❤️';
    default:
      return '';
  }
}

function getStatColor(value: number): string {
  if (value > 75) return styles.barFillGood;
  if (value > 50) return styles.barFillMedium;
  if (value > 25) return styles.barFillLow;
  return styles.barFillCritical;
}

export default function UI() {
  const connectionStatus = useAtomValue(connectionStatusAtom);
  const localStats = useAtomValue(localStatsAtom);
  const players = useAtomValue(playersArrayAtom);
  const playerId = useAtomValue(playerIdAtom);
  const isDead = useAtomValue(isDeadAtom);
  const localPosition = useAtomValue(localPositionAtom);
  const setShowTutorial = useSetAtom(showTutorialAtom);
  const wsRef = useRef<WebSocket | null>(null);
  const [respawnTimer, setRespawnTimer] = useState<number>(0);

  // Helper functions for connection status
  const getConnectionStatusClass = () => {
    switch (connectionStatus) {
      case 'connected':
        return styles.statusConnected;
      case 'connecting':
        return styles.statusConnecting;
      case 'disconnected':
        return styles.statusDisconnected;
      default:
        return '';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return '';
    }
  };

  // Check if this is the first time the user is playing
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  }, [setShowTutorial]);

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

  // Handle respawn timer countdown
  useEffect(() => {
    if (isDead) {
      setRespawnTimer(GAME_CONFIG.RESPAWN_DELAY_SECONDS);

      const countdown = setInterval(() => {
        setRespawnTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    } else {
      setRespawnTimer(0);
    }
  }, [isDead]);

  const getHealthIndicator = (health: number) => {
    if (health > 75) return '💚';
    if (health > 50) return '💛';
    if (health > 25) return '🧡';
    return '❤️';
  };

  // Calculate proximity to buildings
  const nearbyBuildings = useMemo(() => {
    return {
      well: BUILDINGS.some(
        (b) =>
          b.type === BuildingType.WELL &&
          distance(localPosition, b.position) <= GAME_CONFIG.INTERACTION_RADIUS
      ),
      farm: BUILDINGS.some(
        (b) =>
          b.type === BuildingType.FARM &&
          distance(localPosition, b.position) <= GAME_CONFIG.INTERACTION_RADIUS
      ),
      tavern: BUILDINGS.some(
        (b) =>
          b.type === BuildingType.TAVERN &&
          distance(localPosition, b.position) <= GAME_CONFIG.INTERACTION_RADIUS
      ),
    };
  }, [localPosition]);

  return (
    <div className={styles.uiOverlay}>
      {/* Connection Status */}
      <div className={`${styles.connectionStatus} ${getConnectionStatusClass()}`}>
        {getConnectionStatusText()}
      </div>

      {/* Stats Panel */}
      {localStats && (
        <div className={styles.statsPanel}>
          <h3>Survival Stats</h3>

          {/* Hunger */}
          <div className={`${styles.statBar} ${localStats.hunger < 20 ? styles.statBarCritical : ''}`}>
            <div className={styles.statHeader}>
              <div className={styles.statLabel}>
                <span className={styles.statIcon}>{getStatIcon('hunger')}</span>
                Hunger
              </div>
              <div className={styles.statValue}>{Math.round(localStats.hunger)}%</div>
            </div>
            <div className={styles.bar}>
              <div
                className={`${styles.barFill} ${getStatColor(localStats.hunger)}`}
                style={{ width: `${Math.max(0, localStats.hunger)}%` }}
              />
            </div>
            {localStats.hunger < 20 && (
              <div className={styles.criticalWarning}>⚠️ Critical!</div>
            )}
          </div>

          {/* Thirst */}
          <div className={`${styles.statBar} ${localStats.thirst < 20 ? styles.statBarCritical : ''}`}>
            <div className={styles.statHeader}>
              <div className={styles.statLabel}>
                <span className={styles.statIcon}>{getStatIcon('thirst')}</span>
                Thirst
              </div>
              <div className={styles.statValue}>{Math.round(localStats.thirst)}%</div>
            </div>
            <div className={styles.bar}>
              <div
                className={`${styles.barFill} ${getStatColor(localStats.thirst)}`}
                style={{ width: `${Math.max(0, localStats.thirst)}%` }}
              />
            </div>
            {localStats.thirst < 20 && (
              <div className={styles.criticalWarning}>⚠️ Critical!</div>
            )}
          </div>

          {/* Energy */}
          <div className={`${styles.statBar} ${localStats.energy < 20 ? styles.statBarCritical : ''}`}>
            <div className={styles.statHeader}>
              <div className={styles.statLabel}>
                <span className={styles.statIcon}>{getStatIcon('energy')}</span>
                Energy
              </div>
              <div className={styles.statValue}>{Math.round(localStats.energy)}%</div>
            </div>
            <div className={styles.bar}>
              <div
                className={`${styles.barFill} ${getStatColor(localStats.energy)}`}
                style={{ width: `${Math.max(0, localStats.energy)}%` }}
              />
            </div>
            {localStats.energy < 20 && (
              <div className={styles.criticalWarning}>⚠️ Critical!</div>
            )}
          </div>

          {/* Health */}
          <div className={`${styles.statBar} ${localStats.health < 20 ? styles.statBarCritical : ''}`}>
            <div className={styles.statHeader}>
              <div className={styles.statLabel}>
                <span className={styles.statIcon}>{getStatIcon('health')}</span>
                Health
              </div>
              <div className={styles.statValue}>{Math.round(localStats.health)}%</div>
            </div>
            <div className={styles.bar}>
              <div
                className={`${styles.barFill} ${getStatColor(localStats.health)}`}
                style={{ width: `${Math.max(0, localStats.health)}%` }}
              />
            </div>
            {localStats.health < 20 && (
              <div className={styles.criticalWarning}>⚠️ Critical!</div>
            )}
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
        <button
          className={styles.tutorialBtn}
          onClick={() => setShowTutorial(true)}
        >
          Show Tutorial
        </button>
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

      {/* Death Screen */}
      {isDead && (
        <div className={styles.deathScreen}>
          <h2>You Died</h2>
          <p>Your health reached zero!</p>
          <p>You will respawn soon...</p>
          <div className={styles.respawnTimer}>{respawnTimer}s</div>
        </div>
      )}
    </div>
  );
}
