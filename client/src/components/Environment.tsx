'use client';

import { WORLD_BOUNDS } from '@my-town/shared';

export default function Environment() {
  const boundaryHeight = 5;
  const boundaryThickness = 0.5;
  const boundaryWidth = WORLD_BOUNDS.MAX_X - WORLD_BOUNDS.MIN_X;

  // Make boundary walls semi-transparent for infinite world feel
  const boundaryOpacity = 0.3;

  return (
    <>
      {/* Ground - expanded to 1000x1000 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#6b8e23" roughness={0.8} />
      </mesh>

      {/* Grid helper - expanded to match 1000x1000 world */}
      <gridHelper args={[1000, 100, 0x888888, 0x444444]} />

      {/* Boundary Walls - semi-transparent for infinite world feel */}
      {/* North Wall */}
      <mesh position={[0, boundaryHeight / 2, WORLD_BOUNDS.MAX_Z]} castShadow>
        <boxGeometry args={[boundaryWidth, boundaryHeight, boundaryThickness]} />
        <meshStandardMaterial
          color="#8b4513"
          roughness={0.9}
          transparent
          opacity={boundaryOpacity}
        />
      </mesh>

      {/* South Wall */}
      <mesh position={[0, boundaryHeight / 2, WORLD_BOUNDS.MIN_Z]} castShadow>
        <boxGeometry args={[boundaryWidth, boundaryHeight, boundaryThickness]} />
        <meshStandardMaterial
          color="#8b4513"
          roughness={0.9}
          transparent
          opacity={boundaryOpacity}
        />
      </mesh>

      {/* East Wall */}
      <mesh position={[WORLD_BOUNDS.MAX_X, boundaryHeight / 2, 0]} castShadow>
        <boxGeometry args={[boundaryThickness, boundaryHeight, boundaryWidth]} />
        <meshStandardMaterial
          color="#8b4513"
          roughness={0.9}
          transparent
          opacity={boundaryOpacity}
        />
      </mesh>

      {/* West Wall */}
      <mesh position={[WORLD_BOUNDS.MIN_X, boundaryHeight / 2, 0]} castShadow>
        <boxGeometry args={[boundaryThickness, boundaryHeight, boundaryWidth]} />
        <meshStandardMaterial
          color="#8b4513"
          roughness={0.9}
          transparent
          opacity={boundaryOpacity}
        />
      </mesh>
    </>
  );
}
