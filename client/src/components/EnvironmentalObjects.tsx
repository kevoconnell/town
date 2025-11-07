'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

// Simple seeded random number generator
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}

interface RockProps {
  position: [number, number, number];
  seed?: number;
  size?: number;
}

// Procedural rock using deformed sphere
function Rock({ position, seed = 1, size = 1 }: RockProps) {
  const random = useMemo(() => seededRandom(seed), [seed]);

  const geometry = useMemo(() => {
    const baseGeometry = new THREE.SphereGeometry(size, 8, 8);
    const positions = baseGeometry.attributes.position;

    // Deform vertices to create irregular rock shape
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Add random deformation to each vertex
      const deformation = 0.3 + random() * 0.4;
      positions.setXYZ(
        i,
        x * deformation,
        y * (0.5 + random() * 0.3), // Flatten slightly
        z * deformation
      );
    }

    positions.needsUpdate = true;
    baseGeometry.computeVertexNormals();
    return baseGeometry;
  }, [size, random]);

  const rockColor = useMemo(() => {
    const grayShade = 0.3 + random() * 0.2;
    return new THREE.Color(grayShade, grayShade, grayShade);
  }, [random]);

  return (
    <mesh position={position} rotation={[random() * 0.5, random() * Math.PI * 2, random() * 0.5]} castShadow receiveShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial color={rockColor} roughness={0.9} />
    </mesh>
  );
}

// Boulder (larger rock)
function Boulder({ position, seed = 1 }: RockProps) {
  return <Rock position={position} seed={seed} size={1.5 + (seed % 100) / 100} />;
}

// Small pebbles cluster
function Pebbles({
  position,
  count = 5,
  seed = 1
}: {
  position: [number, number, number];
  count?: number;
  seed?: number;
}) {
  const random = useMemo(() => seededRandom(seed), [seed]);

  const pebbles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const offsetX = (random() - 0.5) * 2;
      const offsetZ = (random() - 0.5) * 2;
      const size = 0.2 + random() * 0.3;
      return {
        position: [position[0] + offsetX, position[1], position[2] + offsetZ] as [number, number, number],
        size,
        seed: seed + i
      };
    });
  }, [position, count, random, seed]);

  return (
    <>
      {pebbles.map((pebble, i) => (
        <Rock key={i} position={pebble.position} seed={pebble.seed} size={pebble.size} />
      ))}
    </>
  );
}

// Fence segment
function FenceSegment({
  start,
  end,
  height = 1.5,
  posts = 3
}: {
  start: [number, number, number];
  end: [number, number, number];
  height?: number;
  posts?: number;
}) {
  const fencePosts = useMemo(() => {
    const postPositions: Array<[number, number, number]> = [];
    for (let i = 0; i < posts; i++) {
      const t = i / (posts - 1);
      const x = start[0] + (end[0] - start[0]) * t;
      const z = start[2] + (end[2] - start[2]) * t;
      postPositions.push([x, start[1], z]);
    }
    return postPositions;
  }, [start, end, posts]);

  const railLength = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + Math.pow(end[2] - start[2], 2)
  );

  const angle = Math.atan2(end[2] - start[2], end[0] - start[0]);

  return (
    <group>
      {/* Fence posts */}
      {fencePosts.map((pos, i) => (
        <mesh key={i} position={[pos[0], pos[1] + height / 2, pos[2]]} castShadow>
          <boxGeometry args={[0.15, height, 0.15]} />
          <meshStandardMaterial color="#4a3428" roughness={0.9} />
        </mesh>
      ))}

      {/* Top rail */}
      <mesh
        position={[
          (start[0] + end[0]) / 2,
          start[1] + height * 0.75,
          (start[2] + end[2]) / 2
        ]}
        rotation={[0, angle, 0]}
        castShadow
      >
        <boxGeometry args={[railLength, 0.1, 0.1]} />
        <meshStandardMaterial color="#5a4438" roughness={0.9} />
      </mesh>

      {/* Bottom rail */}
      <mesh
        position={[
          (start[0] + end[0]) / 2,
          start[1] + height * 0.25,
          (start[2] + end[2]) / 2
        ]}
        rotation={[0, angle, 0]}
        castShadow
      >
        <boxGeometry args={[railLength, 0.1, 0.1]} />
        <meshStandardMaterial color="#5a4438" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Fence perimeter
function Fence({
  corners,
  height = 1.5,
  postsPerSegment = 3
}: {
  corners: Array<[number, number, number]>;
  height?: number;
  postsPerSegment?: number;
}) {
  return (
    <>
      {corners.map((corner, i) => {
        const nextCorner = corners[(i + 1) % corners.length];
        return (
          <FenceSegment
            key={i}
            start={corner}
            end={nextCorner}
            height={height}
            posts={postsPerSegment}
          />
        );
      })}
    </>
  );
}

// Grass patch (cluster of thin cylinders)
function GrassPatch({
  position,
  count = 20,
  seed = 1
}: {
  position: [number, number, number];
  count?: number;
  seed?: number;
}) {
  const random = useMemo(() => seededRandom(seed), [seed]);

  const grassBlades = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const offsetX = (random() - 0.5) * 2;
      const offsetZ = (random() - 0.5) * 2;
      const height = 0.3 + random() * 0.4;
      const rotation = random() * 0.2 - 0.1;
      return {
        position: [position[0] + offsetX, position[1], position[2] + offsetZ] as [number, number, number],
        height,
        rotation,
        hue: 0.25 + random() * 0.05 // Slight color variation
      };
    });
  }, [position, count, random]);

  return (
    <>
      {grassBlades.map((blade, i) => (
        <mesh
          key={i}
          position={[blade.position[0], blade.position[1] + blade.height / 2, blade.position[2]]}
          rotation={[blade.rotation, 0, blade.rotation]}
        >
          <cylinderGeometry args={[0.02, 0.03, blade.height, 3]} />
          <meshStandardMaterial
            color={new THREE.Color().setHSL(blade.hue, 0.6, 0.4)}
            roughness={0.8}
          />
        </mesh>
      ))}
    </>
  );
}

// Bush/shrub
function Bush({
  position,
  seed = 1,
  size = 1
}: {
  position: [number, number, number];
  seed?: number;
  size?: number;
}) {
  const random = useMemo(() => seededRandom(seed), [seed]);

  const bushClusters = useMemo(() => {
    return Array.from({ length: 3 + Math.floor(random() * 3) }).map((_, i) => {
      const offsetX = (random() - 0.5) * size * 0.5;
      const offsetY = random() * size * 0.3;
      const offsetZ = (random() - 0.5) * size * 0.5;
      const radius = size * (0.4 + random() * 0.3);
      return { offset: [offsetX, offsetY, offsetZ] as [number, number, number], radius };
    });
  }, [size, random]);

  return (
    <group position={position}>
      {bushClusters.map((cluster, i) => (
        <mesh
          key={i}
          position={cluster.offset}
          castShadow
        >
          <sphereGeometry args={[cluster.radius, 6, 6]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#3d6b29' : '#4a7c2f'}
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

// Mushroom
function Mushroom({
  position,
  seed = 1
}: {
  position: [number, number, number];
  seed?: number;
}) {
  const random = useMemo(() => seededRandom(seed), [seed]);

  const stemHeight = 0.3 + random() * 0.2;
  const capRadius = 0.4 + random() * 0.2;

  return (
    <group position={position}>
      {/* Stem */}
      <mesh position={[0, stemHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, stemHeight, 8]} />
        <meshStandardMaterial color="#e8d5c4" roughness={0.7} />
      </mesh>

      {/* Cap */}
      <mesh position={[0, stemHeight + capRadius * 0.3, 0]} castShadow>
        <sphereGeometry args={[capRadius, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={random() > 0.5 ? '#c53030' : '#92400e'}
          roughness={0.6}
        />
      </mesh>

      {/* White spots on cap (optional) */}
      {random() > 0.5 && (
        <>
          {Array.from({ length: 3 }).map((_, i) => {
            const angle = (i / 3) * Math.PI * 2;
            const spotRadius = capRadius * 0.6;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * spotRadius * 0.5,
                  stemHeight + capRadius * 0.4,
                  Math.sin(angle) * spotRadius * 0.5
                ]}
              >
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#ffffff" roughness={0.5} />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
}

// Campfire
function Campfire({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Fire pit (dark circle) */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1, 16]} />
        <meshStandardMaterial color="#2d2d2d" roughness={1} />
      </mesh>

      {/* Logs arranged in circle */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 0.6;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, 0.15, Math.sin(angle) * radius]}
            rotation={[0, angle + Math.PI / 2, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.1, 0.12, 1, 8]} />
            <meshStandardMaterial color="#3d2817" roughness={0.9} />
          </mesh>
        );
      })}

      {/* Fire (glowing red/orange) */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <coneGeometry args={[0.3, 0.8, 4]} />
        <meshStandardMaterial
          color="#ff6b1a"
          emissive="#ff4500"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Point light for fire glow */}
      <pointLight position={[0, 0.5, 0]} color="#ff6b1a" intensity={2} distance={10} />
    </group>
  );
}

export { Rock, Boulder, Pebbles, FenceSegment, Fence, GrassPatch, Bush, Mushroom, Campfire };
