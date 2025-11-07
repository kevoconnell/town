'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { useAtomValue, useSetAtom } from 'jotai';
import { GAME_CONFIG } from '@my-town/shared';
import { playerIdAtom, localPositionAtom, localRotationAtom } from '@/stores/gameAtoms';

interface LocalPlayerProps {
  playerName: string;
}

const LocalPlayer = forwardRef<Group, LocalPlayerProps>(({ playerName }, ref) => {
  const groupRef = useRef<Group>(null);

  // Expose the group ref to parent components
  useImperativeHandle(ref, () => groupRef.current as Group);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const velocityRef = useRef(new Vector3());

  const playerId = useAtomValue(playerIdAtom);
  const setLocalPosition = useSetAtom(localPositionAtom);
  const setLocalRotation = useSetAtom(localRotationAtom);

  // Setup keyboard event listeners
  useFrame(() => {
    // Only add listeners once
    if (groupRef.current && !groupRef.current.userData.listenersAdded) {
      const handleKeyDown = (e: KeyboardEvent) => {
        keysRef.current[e.key.toLowerCase()] = true;
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        keysRef.current[e.key.toLowerCase()] = false;
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      groupRef.current.userData.listenersAdded = true;
      groupRef.current.userData.cleanup = () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  });

  // Movement handling
  useFrame((state, delta) => {
    if (!playerId || !groupRef.current) return;

    const keys = keysRef.current;
    const direction = new Vector3();

    // Calculate movement direction
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

      // Get camera rotation from userData (set by ThirdPersonCamera)
      const cameraRotation = groupRef.current.userData.cameraRotation || 0;

      // Transform direction relative to camera rotation
      const rotatedDirection = new Vector3(
        direction.x * Math.cos(cameraRotation) - direction.z * Math.sin(cameraRotation),
        0,
        direction.x * Math.sin(cameraRotation) + direction.z * Math.cos(cameraRotation)
      );

      // Update velocity
      velocityRef.current.x = rotatedDirection.x * speed;
      velocityRef.current.z = rotatedDirection.z * speed;

      // Apply movement to player
      groupRef.current.position.x += velocityRef.current.x * delta;
      groupRef.current.position.z += velocityRef.current.z * delta;

      // Clamp to town bounds
      const maxBound = GAME_CONFIG.TOWN_SIZE / 2;
      groupRef.current.position.x = Math.max(-maxBound, Math.min(maxBound, groupRef.current.position.x));
      groupRef.current.position.z = Math.max(-maxBound, Math.min(maxBound, groupRef.current.position.z));

      // Calculate player rotation to face movement direction
      const targetRotation = Math.atan2(rotatedDirection.x, rotatedDirection.z);
      groupRef.current.rotation.y = targetRotation;
    }

    // Update local position and rotation atoms for network sync
    if (groupRef.current) {
      setLocalPosition({
        x: groupRef.current.position.x,
        y: groupRef.current.position.y,
        z: groupRef.current.position.z,
      });
      setLocalRotation(groupRef.current.rotation.y);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh castShadow position={[0, 1, 0]}>
        <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
        <meshStandardMaterial color="#4dabf7" />
      </mesh>

      <Text
        position={[0, 3, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {playerName}
      </Text>
    </group>
  );
});

LocalPlayer.displayName = 'LocalPlayer';

export default LocalPlayer;

// Export the ref type for use in other components
export type LocalPlayerRef = Group;
