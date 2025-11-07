'use client';

import { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';

// Simple seeded random number generator
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}

interface TreeProps {
  position: [number, number, number];
  seed?: number;
  treeType?: 'pine' | 'oak' | 'willow';
}

// Pine tree with layered cone foliage
export function PineTree({ position, seed = 1 }: TreeProps) {
  const random = useMemo(() => seededRandom(seed), [seed]);

  const trunkHeight = 3 + random() * 2;
  const trunkRadius = 0.2 + random() * 0.1;
  const foliageLayers = 3 + Math.floor(random() * 2);

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, trunkHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[trunkRadius, trunkRadius * 1.2, trunkHeight, 8]} />
        <meshStandardMaterial color="#4a3428" roughness={0.9} />
      </mesh>

      {/* Foliage layers (cones stacked) */}
      {Array.from({ length: foliageLayers }).map((_, i) => {
        const layerHeight = trunkHeight * 0.5 + i * (trunkHeight * 0.3);
        const layerRadius = 1.5 - i * 0.3 + random() * 0.2;
        const coneHeight = 2 - i * 0.2;

        return (
          <mesh key={i} position={[0, layerHeight, 0]} castShadow>
            <coneGeometry args={[layerRadius, coneHeight, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#2d5016' : '#365e1f'}
              roughness={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Oak tree with rounded foliage
export function OakTree({ position, seed = 1 }: TreeProps) {
  const random = useMemo(() => seededRandom(seed), [seed]);

  const trunkHeight = 2.5 + random() * 1.5;
  const trunkRadius = 0.25 + random() * 0.1;
  const foliageRadius = 2 + random() * 0.5;

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, trunkHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[trunkRadius, trunkRadius * 1.3, trunkHeight, 8]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
      </mesh>

      {/* Main foliage (sphere cluster) */}
      <mesh position={[0, trunkHeight + foliageRadius * 0.5, 0]} castShadow>
        <sphereGeometry args={[foliageRadius, 8, 8]} />
        <meshStandardMaterial color="#4a7c2f" roughness={0.7} />
      </mesh>

      {/* Additional foliage clusters for variety */}
      <mesh position={[foliageRadius * 0.4, trunkHeight + foliageRadius * 0.3, 0]} castShadow>
        <sphereGeometry args={[foliageRadius * 0.6, 8, 8]} />
        <meshStandardMaterial color="#5a8c3f" roughness={0.7} />
      </mesh>
      <mesh position={[-foliageRadius * 0.3, trunkHeight + foliageRadius * 0.4, foliageRadius * 0.2]} castShadow>
        <sphereGeometry args={[foliageRadius * 0.5, 8, 8]} />
        <meshStandardMaterial color="#3d6b29" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Willow tree with drooping foliage
export function WillowTree({ position, seed = 1 }: TreeProps) {
  const random = useMemo(() => seededRandom(seed), [seed]);

  const trunkHeight = 3 + random() * 1;
  const trunkRadius = 0.3 + random() * 0.1;

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, trunkHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[trunkRadius, trunkRadius * 1.2, trunkHeight, 8]} />
        <meshStandardMaterial color="#4a3428" roughness={0.9} />
      </mesh>

      {/* Upper canopy */}
      <mesh position={[0, trunkHeight, 0]} castShadow>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshStandardMaterial color="#6b9e3d" roughness={0.7} />
      </mesh>

      {/* Drooping foliage (elongated cones) */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 1.2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh
            key={i}
            position={[x, trunkHeight - 0.5, z]}
            rotation={[0, 0, 0]}
            castShadow
          >
            <coneGeometry args={[0.5, 2.5 + random() * 0.5, 6]} />
            <meshStandardMaterial color="#7aae4d" roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

// Generic tree component that chooses type
export function Tree({ position, seed = 1, treeType }: TreeProps) {
  const random = useMemo(() => seededRandom(seed), [seed]);
  const type = treeType || (['pine', 'oak', 'willow'][Math.floor(random() * 3)] as 'pine' | 'oak' | 'willow');

  switch (type) {
    case 'pine':
      return <PineTree position={position} seed={seed} />;
    case 'oak':
      return <OakTree position={position} seed={seed} />;
    case 'willow':
      return <WillowTree position={position} seed={seed} />;
    default:
      return <PineTree position={position} seed={seed} />;
  }
}

// Instanced trees for performance when rendering many trees
interface InstancedTreesProps {
  positions: Array<[number, number, number]>;
  seeds?: number[];
  treeType?: 'pine' | 'oak' | 'willow';
}

export function InstancedTrees({ positions, seeds, treeType = 'pine' }: InstancedTreesProps) {
  return (
    <>
      {positions.map((pos, i) => (
        <Tree
          key={i}
          position={pos}
          seed={seeds?.[i] || i}
          treeType={treeType}
        />
      ))}
    </>
  );
}

// Simple tree cluster generator
export function TreeCluster({
  center,
  count = 5,
  radius = 5,
  seed = 1
}: {
  center: [number, number, number];
  count?: number;
  radius?: number;
  seed?: number;
}) {
  const random = useMemo(() => seededRandom(seed), [seed]);

  const positions = useMemo(() => {
    const pos: Array<[number, number, number]> = [];
    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2;
      const dist = random() * radius;
      const x = center[0] + Math.cos(angle) * dist;
      const z = center[2] + Math.sin(angle) * dist;
      pos.push([x, center[1], z]);
    }
    return pos;
  }, [center, count, radius, random]);

  const seeds = useMemo(() => {
    return positions.map((_, i) => seed + i);
  }, [positions, seed]);

  return <InstancedTrees positions={positions} seeds={seeds} />;
}

export default Tree;
