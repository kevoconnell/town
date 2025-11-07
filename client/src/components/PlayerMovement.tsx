'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useAtomValue, useSetAtom } from 'jotai';
import { GAME_CONFIG } from '@my-town/shared';
import { playerIdAtom, localPositionAtom } from '@/stores/gameAtoms';

export default function PlayerMovement() {
  const { camera } = useThree();
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const velocityRef = useRef(new Vector3());
  const directionRef = useRef(new Vector3());

  const playerId = useAtomValue(playerIdAtom);
  const setLocalPosition = useSetAtom(localPositionAtom);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!playerId) return;

    const keys = keysRef.current;
    const direction = directionRef.current;

    // Calculate movement direction
    direction.set(0, 0, 0);

    if (keys['w']) direction.z -= 1;
    if (keys['s']) direction.z += 1;
    if (keys['a']) direction.x -= 1;
    if (keys['d']) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize();

      // Apply movement speed
      const speed = keys['shift']
        ? GAME_CONFIG.PLAYER_MOVE_SPEED * GAME_CONFIG.RUN_SPEED_MULTIPLIER
        : GAME_CONFIG.PLAYER_MOVE_SPEED;

      // Transform direction to camera space
      direction.applyEuler(camera.rotation);
      direction.y = 0; // Keep movement horizontal
      direction.normalize();

      // Update velocity
      velocityRef.current.x = direction.x * speed;
      velocityRef.current.z = direction.z * speed;

      // Apply movement
      camera.position.x += velocityRef.current.x * delta;
      camera.position.z += velocityRef.current.z * delta;

      // Keep player at ground level
      camera.position.y = 2;

      // Clamp to town bounds
      const maxBound = GAME_CONFIG.TOWN_SIZE / 2;
      camera.position.x = Math.max(-maxBound, Math.min(maxBound, camera.position.x));
      camera.position.z = Math.max(-maxBound, Math.min(maxBound, camera.position.z));
    }

    // Update local position atom for minimap
    setLocalPosition({
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    });
  });

  return null;
}
