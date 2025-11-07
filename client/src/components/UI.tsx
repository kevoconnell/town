'use client';

import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import {
  connectedAtom,
  localStatsAtom,
  playersArrayAtom,
  playerIdAtom,
} from '@/stores/gameAtoms';
import { ActionType, NetworkMessage, MessageType } from '@my-town/shared';
import styles from './UI.module.css';

export default function UI() {
  const connected = useAtomValue(connectedAtom);
  const localStats = useAtomValue(localStatsAtom);
  const players = useAtomValue(playersArrayAtom);
  const playerId = useAtomValue(playerIdAtom);
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

  // Get stat color based on value
  const getStatColor = (value: number): string => {
    if (value > 60) return styles.statGood;
    if (value > 20) return styles.statWarning;
    return styles.statCritical;
  };

  // Get stat icon
  const getStatIcon = (statType: string): string => {
    switch (statType) {
      case 'hunger': return '🍖';
      case 'thirst': return '💧';
      case 'energy': return '⚡';
      case 'health': return '❤️';
      default: return '';
    }
  };


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

      {/* Action Buttons */}
      <div className={styles.actionsPanel}>
        <button className={styles.actionBtn} onClick={() => sendAction(ActionType.GATHER_WATER)}>
          Drink Water [E]
        </button>
        <button className={styles.actionBtn} onClick={() => sendAction(ActionType.GATHER_FOOD)}>
          Eat Food [F]
        </button>
        <button className={styles.actionBtn} onClick={() => sendAction(ActionType.REST)}>
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
