'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import UI from './UI';
import NetworkManager from './NetworkManager';
import NameInput from './NameInput';
import Minimap from './Minimap';

export default function Game() {
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [showNameInput, setShowNameInput] = useState(true);

  useEffect(() => {
    // Check if player already has a saved name
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setPlayerName(savedName);
      setShowNameInput(false);
    }
  }, []);

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    setShowNameInput(false);
  };

  return (
    <>
      {showNameInput && <NameInput onNameSubmit={handleNameSubmit} />}

      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 75 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        {playerName && <Scene playerName={playerName} />}
      </Canvas>

      <UI />
      <Minimap />
      {playerName && <NetworkManager playerName={playerName} />}
    </>
  );
}
