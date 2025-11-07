'use client';

import { useRef, useState, useEffect } from 'react';
import { BuildingLocation, BuildingType } from '@my-town/shared';
import { Text } from '@react-three/drei';

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

  const getBuildingGeometry = () => {
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

  return (
    <group position={[building.position.x, building.position.y, building.position.z]}>
      <mesh ref={meshRef} position={[0, 2, 0]} castShadow receiveShadow>
        {getBuildingGeometry()}
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
