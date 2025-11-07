'use client';

import { WORLD_BOUNDS } from '@my-town/shared';

export default function Environment() {
  const boundaryHeight = 5;
  const boundaryThickness = 0.5;
  const boundaryWidth = WORLD_BOUNDS.MAX_X - WORLD_BOUNDS.MIN_X;

  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#6b8e23" roughness={0.8} />
      </mesh>

      {/* Grid helper */}
      <gridHelper args={[400, 40, 0x888888, 0x444444]} />

      {/* Boundary Walls */}
      {/* North Wall */}
      <mesh position={[0, boundaryHeight / 2, WORLD_BOUNDS.MAX_Z]} castShadow>
        <boxGeometry args={[boundaryWidth, boundaryHeight, boundaryThickness]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>

      {/* South Wall */}
      <mesh position={[0, boundaryHeight / 2, WORLD_BOUNDS.MIN_Z]} castShadow>
        <boxGeometry args={[boundaryWidth, boundaryHeight, boundaryThickness]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>

      {/* East Wall */}
      <mesh position={[WORLD_BOUNDS.MAX_X, boundaryHeight / 2, 0]} castShadow>
        <boxGeometry args={[boundaryThickness, boundaryHeight, boundaryWidth]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>

      {/* West Wall */}
      <mesh position={[WORLD_BOUNDS.MIN_X, boundaryHeight / 2, 0]} castShadow>
        <boxGeometry args={[boundaryThickness, boundaryHeight, boundaryWidth]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
    </>
  );
}
