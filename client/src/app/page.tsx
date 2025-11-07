'use client';

import dynamic from 'next/dynamic';

// Dynamically import the game to avoid SSR issues with Three.js
const Game = dynamic(() => import('@/components/Game'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: 'white',
      fontSize: '24px'
    }}>
      Loading Game...
    </div>
  ),
});

export default function Home() {
  return <Game />;
}
