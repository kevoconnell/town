'use client';

import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import Scene from './Scene';
import UI from './UI';
import NetworkManager from './NetworkManager';

export default function Game() {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 2, 5], fov: 75 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Scene />
        <PointerLockControls />
      </Canvas>

      <UI />
      <NetworkManager />
    </>
  );
}
