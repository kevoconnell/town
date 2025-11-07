'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import PlayerMovement from './PlayerMovement';
import Environment from './Environment';
import OtherPlayers from './OtherPlayers';
import Buildings from './Buildings';

export default function Scene() {
  return (
    <>
      <color attach="background" args={['#87ceeb']} />
      <fog attach="fog" args={['#87ceeb', 50, 300]} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={0.8}
        castShadow
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Environment />
      <Buildings />
      <OtherPlayers />
      <PlayerMovement />
    </>
  );
}
