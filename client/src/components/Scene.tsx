'use client';

import { useRef } from 'react';
import { Group } from 'three';
import Environment from './Environment';
import OtherPlayers from './OtherPlayers';
import Buildings from './Buildings';
import LocalPlayer from './LocalPlayer';
import ThirdPersonCamera from './ThirdPersonCamera';

interface SceneProps {
  playerName: string;
}

export default function Scene({ playerName }: SceneProps) {
  const playerRef = useRef<Group>(null);

  return (
    <>
      <color attach="background" args={['#87ceeb']} />
      {/* Fog set far out to create infinite world feeling like Minecraft */}
      <fog attach="fog" args={['#87ceeb', 200, 800]} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={0.8}
        castShadow
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Environment />
      <Buildings />
      <OtherPlayers />
      <LocalPlayer ref={playerRef} playerName={playerName} />
      <ThirdPersonCamera targetRef={playerRef} />
    </>
  );
}
