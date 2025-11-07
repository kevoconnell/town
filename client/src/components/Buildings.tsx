'use client';

import { useRef, useState, useEffect } from 'react';
import { BuildingLocation, BuildingType } from '@my-town/shared';
import { Text, Detailed } from '@react-three/drei';

const BUILDING_COLORS: Record<BuildingType, string> = {
  [BuildingType.WELL]: '#4a5568',
  [BuildingType.MARKET]: '#d97706',
  [BuildingType.FARM]: '#92400e',
  [BuildingType.TAVERN]: '#7c2d12',
  [BuildingType.HOUSE]: '#666666',
};

const DEFAULT_BUILDINGS: BuildingLocation[] = [
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

function Building({ building }: { building: BuildingLocation }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // High detail geometry (0-100 units)
  const getHighDetailGeometry = () => {
    switch (building.type) {
      case BuildingType.WELL:
        return <cylinderGeometry args={[2, 2, 3, 16]} />;
      case BuildingType.MARKET:
        return <boxGeometry args={[8, 4, 8]} />;
      case BuildingType.FARM:
        return <boxGeometry args={[10, 3, 6]} />;
      case BuildingType.TAVERN:
        return <boxGeometry args={[6, 5, 6]} />;
      default:
        return <boxGeometry args={[5, 4, 5]} />;
    }
  };

  // Medium detail geometry (100-300 units) - simplified
  const getMediumDetailGeometry = () => {
    switch (building.type) {
      case BuildingType.WELL:
        return <cylinderGeometry args={[2, 2, 3, 8]} />; // Fewer segments
      case BuildingType.MARKET:
        return <boxGeometry args={[8, 4, 8]} />;
      case BuildingType.FARM:
        return <boxGeometry args={[10, 3, 6]} />;
      case BuildingType.TAVERN:
        return <boxGeometry args={[6, 5, 6]} />;
      default:
        return <boxGeometry args={[5, 4, 5]} />;
    }
  };

  // Low detail geometry (300+ units) - very simple
  const getLowDetailGeometry = () => {
    return <boxGeometry args={[6, 4, 6]} />; // All buildings become simple boxes
  };

  return (
    <group position={[building.position.x, building.position.y, building.position.z]}>
      <Detailed distances={[0, 100, 300]}>
        {/* High detail (close) */}
        <group>
          <mesh ref={meshRef} position={[0, 2, 0]} castShadow receiveShadow>
            {getHighDetailGeometry()}
            <meshStandardMaterial color={BUILDING_COLORS[building.type]} />
          </mesh>
          <Text
            position={[0, 6, 0]}
            fontSize={0.8}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {building.name}
          </Text>
        </group>

        {/* Medium detail */}
        <group>
          <mesh position={[0, 2, 0]} castShadow receiveShadow>
            {getMediumDetailGeometry()}
            <meshStandardMaterial color={BUILDING_COLORS[building.type]} />
          </mesh>
          <Text
            position={[0, 6, 0]}
            fontSize={0.6}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {building.name}
          </Text>
        </group>

        {/* Low detail (far) - no text */}
        <mesh position={[0, 2, 0]} receiveShadow>
          {getLowDetailGeometry()}
          <meshStandardMaterial color={BUILDING_COLORS[building.type]} />
        </mesh>
      </Detailed>
    </group>
  );
}

export default function Buildings() {
  const [buildings] = useState<BuildingLocation[]>(DEFAULT_BUILDINGS);

  return (
    <>
      {buildings.map((building) => (
        <Building key={building.id} building={building} />
      ))}
    </>
  );
}
