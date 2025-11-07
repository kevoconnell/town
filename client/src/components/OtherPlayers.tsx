'use client';

import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import { playersArrayAtom, playerIdAtom } from '@/stores/gameAtoms';
import { PlayerState } from '@my-town/shared';

function PlayerMesh({ player }: { player: PlayerState }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const colors = ['#ff6b6b', '#4dabf7', '#51cf66', '#ffd43b', '#f06595', '#845ef7'];
  const color = colors[Math.abs(player.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length];

  return (
    <group position={[player.position.x, player.position.y + 1, player.position.z]} rotation={[0, player.rotation, 0]}>
      <mesh ref={meshRef} castShadow>
        <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <Text
        position={[0, 2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {player.name}
      </Text>
    </group>
  );
}

export default function OtherPlayers() {
  const players = useAtomValue(playersArrayAtom);
  const playerId = useAtomValue(playerIdAtom);

  return (
    <>
      {players
        .filter((player) => player.id !== playerId)
        .map((player) => (
          <PlayerMesh key={player.id} player={player} />
        ))}
    </>
  );
}
