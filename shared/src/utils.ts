import { Vector3 } from './types';

export function distance(a: Vector3, b: Vector3): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2) +
    Math.pow(a.z - b.z, 2)
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export interface SpawnPoint {
  position: Vector3;
  rotation: number;
}

export function generateSpawnPosition(
  buildings: { position: Vector3 }[],
  spawnRadius: number = 20,
  minBuildingDistance: number = 8
): SpawnPoint {
  const maxAttempts = 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random position within spawn radius
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * spawnRadius;

    const position: Vector3 = {
      x: Math.cos(angle) * distance,
      y: 0,
      z: Math.sin(angle) * distance,
    };

    // Check if position is safe (not too close to buildings)
    let isSafe = true;
    for (const building of buildings) {
      const dist = Math.sqrt(
        Math.pow(position.x - building.position.x, 2) +
        Math.pow(position.z - building.position.z, 2)
      );

      if (dist < minBuildingDistance) {
        isSafe = false;
        break;
      }
    }

    if (isSafe) {
      return {
        position,
        rotation: Math.random() * Math.PI * 2, // Random rotation
      };
    }
  }

  // Fallback: spawn at edge of radius if no safe spot found
  const fallbackAngle = Math.random() * Math.PI * 2;
  return {
    position: {
      x: Math.cos(fallbackAngle) * spawnRadius,
      y: 0,
      z: Math.sin(fallbackAngle) * spawnRadius,
    },
    rotation: Math.random() * Math.PI * 2,
  };
}
