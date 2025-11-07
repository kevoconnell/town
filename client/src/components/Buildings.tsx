'use client';

import { useState } from 'react';
import { BuildingLocation, BuildingType } from '@my-town/shared';
import { Text } from '@react-three/drei';
import ProceduralBuilding from './ProceduralBuildings';

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
  // Generate seed from building id for deterministic randomization
  const seed = building.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return (
    <group position={[building.position.x, building.position.y, building.position.z]}>
      <ProceduralBuilding type={building.type} seed={seed} />

      <Text
        position={[0, 8, 0]}
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
