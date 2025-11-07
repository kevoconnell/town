'use client';

export default function Environment() {
  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#6b8e23" roughness={0.8} />
      </mesh>

      {/* Grid helper */}
      <gridHelper args={[400, 40, 0x888888, 0x444444]} />
    </>
  );
}
