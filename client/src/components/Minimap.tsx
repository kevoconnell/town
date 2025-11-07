'use client';

import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import {
  localPositionAtom,
  playersArrayAtom,
  playerIdAtom,
} from '@/stores/gameAtoms';
import { BuildingType, GAME_CONFIG } from '@my-town/shared';
import styles from './Minimap.module.css';

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

const BUILDING_COLORS: Record<BuildingType, string> = {
  [BuildingType.WELL]: '#4a5568',
  [BuildingType.MARKET]: '#d97706',
  [BuildingType.FARM]: '#92400e',
  [BuildingType.TAVERN]: '#7c2d12',
  [BuildingType.HOUSE]: '#666666',
};

// Minimap configuration
const MINIMAP_SIZE = 200;
const WORLD_SIZE = GAME_CONFIG.TOWN_SIZE;
const SCALE = MINIMAP_SIZE / WORLD_SIZE;

export default function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const localPosition = useAtomValue(localPositionAtom);
  const players = useAtomValue(playersArrayAtom);
  const playerId = useAtomValue(playerIdAtom);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Draw border
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Helper function to convert world coordinates to minimap coordinates
    const worldToMinimap = (x: number, z: number) => {
      return {
        x: (x + WORLD_SIZE / 2) * SCALE,
        y: (z + WORLD_SIZE / 2) * SCALE,
      };
    };

    // Draw buildings
    BUILDINGS.forEach((building) => {
      const pos = worldToMinimap(building.position.x, building.position.z);

      ctx.fillStyle = BUILDING_COLORS[building.type];

      // Different sizes for different building types
      let size = 8;
      if (building.type === BuildingType.WELL) {
        // Draw well as a circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        if (building.type === BuildingType.FARM) size = 10;
        if (building.type === BuildingType.TAVERN) size = 8;
        if (building.type === BuildingType.MARKET) size = 9;

        ctx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
      }
    });

    // Draw other players
    players.forEach((player) => {
      if (player.id === playerId) return; // Skip local player

      const pos = worldToMinimap(player.position.x, player.position.z);

      // Draw player as a small circle
      ctx.fillStyle = player.isDead ? '#666' : '#4ade80';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw local player (on top)
    const localPos = worldToMinimap(localPosition.x, localPosition.z);

    // Draw player as a triangle pointing up
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;

    const size = 6;
    ctx.beginPath();
    ctx.moveTo(localPos.x, localPos.y - size); // Top point
    ctx.lineTo(localPos.x - size, localPos.y + size); // Bottom left
    ctx.lineTo(localPos.x + size, localPos.y + size); // Bottom right
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw direction indicator (small line)
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(localPos.x, localPos.y);
    ctx.lineTo(localPos.x, localPos.y - 10);
    ctx.stroke();

  }, [localPosition, players, playerId]);

  return (
    <div className={styles.minimapContainer}>
      <div className={styles.minimapHeader}>Map</div>
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        className={styles.minimapCanvas}
      />
      <div className={styles.minimapLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#3b82f6' }}></span>
          You
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#4ade80' }}></span>
          Players
        </div>
      </div>
    </div>
  );
}
