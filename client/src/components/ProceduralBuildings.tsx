'use client';

import { useMemo } from 'react';
import { BuildingType } from '@my-town/shared';
import * as THREE from 'three';

interface ProceduralBuildingProps {
  type: BuildingType;
  seed?: number;
}

// Simple seeded random number generator
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}

// Roof component
function Roof({
  width,
  depth,
  height,
  color = '#8b4513',
  roofType = 'pyramid'
}: {
  width: number;
  depth: number;
  height: number;
  color?: string;
  roofType?: 'pyramid' | 'cone';
}) {
  return (
    <mesh position={[0, height / 2, 0]} castShadow>
      {roofType === 'pyramid' ? (
        <coneGeometry args={[Math.max(width, depth) * 0.7, height, 4]} />
      ) : (
        <coneGeometry args={[Math.max(width, depth) * 0.7, height, 8]} />
      )}
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Chimney component
function Chimney({
  position,
  height = 1.5,
  color = '#5a3a2a'
}: {
  position: [number, number, number];
  height?: number;
  color?: string;
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.5, height, 0.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Door component
function Door({
  position,
  width = 1.2,
  height = 2,
  color = '#3d2817'
}: {
  position: [number, number, number];
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[width, height, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Door handle */}
      <mesh position={[width * 0.3, 0, 0.1]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Window component
function Window({
  position,
  width = 1,
  height = 1,
  color = '#6db8d8'
}: {
  position: [number, number, number];
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <group position={position}>
      {/* Window pane */}
      <mesh castShadow>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.7}
          metalness={0.5}
          roughness={0.1}
        />
      </mesh>
      {/* Window frame */}
      <lineSegments>
        <edgesGeometry
          args={[new THREE.BoxGeometry(width, height, 0.1)]}
        />
        <lineBasicMaterial color="#4a3428" />
      </lineSegments>
    </group>
  );
}

// Enhanced Well with LatheGeometry
export function ProceduralWell({ seed = 1 }: { seed?: number }) {
  const random = useMemo(() => seededRandom(seed), [seed]);

  const wellHeight = 2 + random() * 1;
  const wellRadius = 1.5 + random() * 0.5;
  const roofHeight = 2 + random() * 0.5;

  // LatheGeometry points for well body
  const points = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(wellRadius * 0.8, 0));
    pts.push(new THREE.Vector2(wellRadius, wellHeight * 0.3));
    pts.push(new THREE.Vector2(wellRadius, wellHeight));
    pts.push(new THREE.Vector2(wellRadius * 0.9, wellHeight));
    return pts;
  }, [wellRadius, wellHeight]);

  const latheGeometry = useMemo(() => {
    return new THREE.LatheGeometry(points, 16);
  }, [points]);

  return (
    <group>
      {/* Well body using LatheGeometry */}
      <mesh position={[0, wellHeight / 2, 0]} castShadow receiveShadow>
        <primitive object={latheGeometry} attach="geometry" />
        <meshStandardMaterial color="#6b7280" roughness={0.8} />
      </mesh>

      {/* Well opening (dark water) */}
      <mesh position={[0, wellHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[wellRadius * 0.7, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Support posts for roof */}
      <mesh position={[-wellRadius, wellHeight + roofHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, roofHeight, 8]} />
        <meshStandardMaterial color="#4a3428" />
      </mesh>
      <mesh position={[wellRadius, wellHeight + roofHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, roofHeight, 8]} />
        <meshStandardMaterial color="#4a3428" />
      </mesh>

      {/* Well roof */}
      <mesh position={[0, wellHeight + roofHeight, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[wellRadius * 1.2, roofHeight * 0.8, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  );
}

// Enhanced Market with multiple primitives
export function ProceduralMarket({ seed = 1 }: { seed?: number }) {
  const random = useMemo(() => seededRandom(seed), [seed]);

  const buildingWidth = 8 + random() * 2;
  const buildingDepth = 8 + random() * 2;
  const buildingHeight = 3.5 + random() * 1;
  const roofHeight = 2.5;

  return (
    <group>
      {/* Main building structure */}
      <mesh position={[0, buildingHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[buildingWidth, buildingHeight, buildingDepth]} />
        <meshStandardMaterial color="#d97706" roughness={0.7} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, buildingHeight + roofHeight / 2, 0]} castShadow>
        <coneGeometry args={[Math.max(buildingWidth, buildingDepth) * 0.7, roofHeight, 4]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>

      {/* Front door */}
      <Door
        position={[0, buildingHeight / 2 - 0.75, buildingDepth / 2 + 0.08]}
        width={1.5}
        height={2.5}
      />

      {/* Windows - front */}
      <Window position={[-buildingWidth * 0.3, buildingHeight / 2 + 0.5, buildingDepth / 2 + 0.06]} />
      <Window position={[buildingWidth * 0.3, buildingHeight / 2 + 0.5, buildingDepth / 2 + 0.06]} />

      {/* Windows - sides */}
      <Window position={[buildingWidth / 2 + 0.06, buildingHeight / 2 + 0.5, 0]} />
      <Window position={[-buildingWidth / 2 - 0.06, buildingHeight / 2 + 0.5, 0]} />

      {/* Market stall awning */}
      <mesh position={[0, buildingHeight / 2, buildingDepth / 2 + 2]} castShadow>
        <boxGeometry args={[buildingWidth * 0.8, 0.1, 2]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      {/* Awning supports */}
      <mesh position={[-buildingWidth * 0.35, buildingHeight / 2 - 1, buildingDepth / 2 + 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
        <meshStandardMaterial color="#4a3428" />
      </mesh>
      <mesh position={[buildingWidth * 0.35, buildingHeight / 2 - 1, buildingDepth / 2 + 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
        <meshStandardMaterial color="#4a3428" />
      </mesh>
    </group>
  );
}

// Enhanced Farm with barn-like structure
export function ProceduralFarm({ seed = 1 }: { seed?: number }) {
  const random = useMemo(() => seededRandom(seed), [seed]);

  const buildingWidth = 10 + random() * 2;
  const buildingDepth = 6 + random() * 1;
  const buildingHeight = 3 + random() * 0.5;
  const roofHeight = 3;

  return (
    <group>
      {/* Main barn structure */}
      <mesh position={[0, buildingHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[buildingWidth, buildingHeight, buildingDepth]} />
        <meshStandardMaterial color="#92400e" roughness={0.9} />
      </mesh>

      {/* Barn roof (triangular) */}
      <mesh position={[0, buildingHeight + roofHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <coneGeometry args={[buildingDepth * 0.7, roofHeight, 3]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>

      {/* Barn doors */}
      <Door
        position={[0, buildingHeight / 2 - 0.5, buildingDepth / 2 + 0.08]}
        width={2}
        height={2.5}
        color="#4a2617"
      />

      {/* Side windows */}
      <Window position={[buildingWidth / 2 + 0.06, buildingHeight / 2, 0]} width={0.8} height={0.8} />
      <Window position={[-buildingWidth / 2 - 0.06, buildingHeight / 2, 0]} width={0.8} height={0.8} />

      {/* Hay loft window */}
      <Window
        position={[0, buildingHeight + roofHeight * 0.3, buildingDepth / 2 + 0.06]}
        width={1.2}
        height={0.8}
      />

      {/* Farm silo */}
      <mesh position={[buildingWidth / 2 + 2, buildingHeight + 1, 0]} castShadow>
        <cylinderGeometry args={[1, 1, buildingHeight * 2, 12]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh position={[buildingWidth / 2 + 2, buildingHeight * 2 + 1.5, 0]} castShadow>
        <coneGeometry args={[1.2, 1.5, 12]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>

      {/* Fence posts */}
      {[-3, -1, 1, 3].map((offset, i) => (
        <mesh key={i} position={[-buildingWidth / 2 - 1, 0.75, offset]} castShadow>
          <boxGeometry args={[0.2, 1.5, 0.2]} />
          <meshStandardMaterial color="#4a3428" />
        </mesh>
      ))}
    </group>
  );
}

// Enhanced Tavern with detailed structure
export function ProceduralTavern({ seed = 1 }: { seed?: number }) {
  const random = useMemo(() => seededRandom(seed), [seed]);

  const buildingWidth = 6 + random() * 1;
  const buildingDepth = 6 + random() * 1;
  const buildingHeight = 4.5 + random() * 0.5;
  const roofHeight = 2.5;

  return (
    <group>
      {/* Main tavern structure */}
      <mesh position={[0, buildingHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[buildingWidth, buildingHeight, buildingDepth]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.8} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, buildingHeight + roofHeight / 2, 0]} castShadow>
        <coneGeometry args={[Math.max(buildingWidth, buildingDepth) * 0.75, roofHeight, 8]} />
        <meshStandardMaterial color="#4a1f0f" />
      </mesh>

      {/* Chimney */}
      <Chimney position={[buildingWidth * 0.25, buildingHeight + roofHeight, buildingDepth * 0.25]} height={2} />

      {/* Front door */}
      <Door
        position={[0, buildingHeight / 2 - 1.25, buildingDepth / 2 + 0.08]}
        width={1.3}
        height={2.5}
        color="#2d1810"
      />

      {/* Windows with light glow */}
      <Window position={[-buildingWidth * 0.35, buildingHeight / 2, buildingDepth / 2 + 0.06]} color="#ffcc66" />
      <Window position={[buildingWidth * 0.35, buildingHeight / 2, buildingDepth / 2 + 0.06]} color="#ffcc66" />
      <Window position={[buildingWidth / 2 + 0.06, buildingHeight / 2, 0]} color="#ffcc66" />
      <Window position={[-buildingWidth / 2 - 0.06, buildingHeight / 2, 0]} color="#ffcc66" />

      {/* Upper floor windows */}
      <Window
        position={[-buildingWidth * 0.35, buildingHeight / 2 + 1.8, buildingDepth / 2 + 0.06]}
        width={0.8}
        height={0.8}
        color="#ffcc66"
      />
      <Window
        position={[buildingWidth * 0.35, buildingHeight / 2 + 1.8, buildingDepth / 2 + 0.06]}
        width={0.8}
        height={0.8}
        color="#ffcc66"
      />

      {/* Tavern sign */}
      <mesh position={[0, buildingHeight / 2 + 2, buildingDepth / 2 + 0.5]} castShadow>
        <boxGeometry args={[2, 1, 0.1]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>

      {/* Sign post */}
      <mesh position={[0, buildingHeight / 2 + 1, buildingDepth / 2 + 0.5]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2, 8]} />
        <meshStandardMaterial color="#4a3428" />
      </mesh>

      {/* Entrance steps */}
      <mesh position={[0, 0.15, buildingDepth / 2 + 0.8]} receiveShadow>
        <boxGeometry args={[2, 0.3, 0.8]} />
        <meshStandardMaterial color="#5a5a5a" />
      </mesh>
    </group>
  );
}

// Main component that selects the right building type
export default function ProceduralBuilding({ type, seed = 1 }: ProceduralBuildingProps) {
  switch (type) {
    case BuildingType.WELL:
      return <ProceduralWell seed={seed} />;
    case BuildingType.MARKET:
      return <ProceduralMarket seed={seed} />;
    case BuildingType.FARM:
      return <ProceduralFarm seed={seed} />;
    case BuildingType.TAVERN:
      return <ProceduralTavern seed={seed} />;
    default:
      return null;
  }
}
