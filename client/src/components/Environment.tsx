'use client';

import { useMemo } from 'react';
import { WORLD_BOUNDS } from '@my-town/shared';
import { TreeCluster } from './ProceduralTrees';
import { Rock, Boulder, Bush, Mushroom, Campfire, Fence, GrassPatch } from './EnvironmentalObjects';

// Simple seeded random number generator
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}

export default function Environment() {
  const boundaryHeight = 5;
  const boundaryThickness = 0.5;
  const boundaryWidth = WORLD_BOUNDS.MAX_X - WORLD_BOUNDS.MIN_X;

  // Generate random positions for environmental objects
  const environmentalObjects = useMemo(() => {
    const random = seededRandom(12345);
    const objects = {
      treeClusters: [] as Array<{ center: [number, number, number]; count: number; radius: number; seed: number }>,
      rocks: [] as Array<{ position: [number, number, number]; seed: number }>,
      boulders: [] as Array<{ position: [number, number, number]; seed: number }>,
      bushes: [] as Array<{ position: [number, number, number]; seed: number; size: number }>,
      mushrooms: [] as Array<{ position: [number, number, number]; seed: number }>,
      grassPatches: [] as Array<{ position: [number, number, number]; seed: number }>,
    };

    // Generate tree clusters around the world
    for (let i = 0; i < 8; i++) {
      const x = (random() - 0.5) * (WORLD_BOUNDS.MAX_X - WORLD_BOUNDS.MIN_X) * 0.8;
      const z = (random() - 0.5) * (WORLD_BOUNDS.MAX_Z - WORLD_BOUNDS.MIN_Z) * 0.8;

      // Avoid spawning too close to center (where buildings are)
      if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;

      objects.treeClusters.push({
        center: [x, 0, z],
        count: 3 + Math.floor(random() * 5),
        radius: 8 + random() * 5,
        seed: i * 1000
      });
    }

    // Generate scattered rocks
    for (let i = 0; i < 30; i++) {
      const x = (random() - 0.5) * (WORLD_BOUNDS.MAX_X - WORLD_BOUNDS.MIN_X) * 0.9;
      const z = (random() - 0.5) * (WORLD_BOUNDS.MAX_Z - WORLD_BOUNDS.MIN_Z) * 0.9;

      objects.rocks.push({
        position: [x, 0.3, z],
        seed: i
      });
    }

    // Generate boulders
    for (let i = 0; i < 10; i++) {
      const x = (random() - 0.5) * (WORLD_BOUNDS.MAX_X - WORLD_BOUNDS.MIN_X) * 0.85;
      const z = (random() - 0.5) * (WORLD_BOUNDS.MAX_Z - WORLD_BOUNDS.MIN_Z) * 0.85;

      objects.boulders.push({
        position: [x, 0.5, z],
        seed: i + 100
      });
    }

    // Generate bushes
    for (let i = 0; i < 20; i++) {
      const x = (random() - 0.5) * (WORLD_BOUNDS.MAX_X - WORLD_BOUNDS.MIN_X) * 0.85;
      const z = (random() - 0.5) * (WORLD_BOUNDS.MAX_Z - WORLD_BOUNDS.MIN_Z) * 0.85;

      objects.bushes.push({
        position: [x, 0.5, z],
        seed: i + 200,
        size: 1 + random() * 0.5
      });
    }

    // Generate mushrooms (in clusters near trees)
    objects.treeClusters.forEach((cluster, clusterIndex) => {
      for (let i = 0; i < 3; i++) {
        const angle = random() * Math.PI * 2;
        const dist = random() * cluster.radius * 0.5;
        const x = cluster.center[0] + Math.cos(angle) * dist;
        const z = cluster.center[2] + Math.sin(angle) * dist;

        objects.mushrooms.push({
          position: [x, 0.05, z],
          seed: clusterIndex * 10 + i + 300
        });
      }
    });

    // Generate grass patches
    for (let i = 0; i < 15; i++) {
      const x = (random() - 0.5) * (WORLD_BOUNDS.MAX_X - WORLD_BOUNDS.MIN_X) * 0.7;
      const z = (random() - 0.5) * (WORLD_BOUNDS.MAX_Z - WORLD_BOUNDS.MIN_Z) * 0.7;

      objects.grassPatches.push({
        position: [x, 0, z],
        seed: i + 400
      });
    }

    return objects;
  }, []);

  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#6b8e23" roughness={0.8} />
      </mesh>

      {/* Grid helper */}
      <gridHelper args={[400, 40, 0x888888, 0x444444]} />

      {/* Boundary Walls */}
      {/* North Wall */}
      <mesh position={[0, boundaryHeight / 2, WORLD_BOUNDS.MAX_Z]} castShadow>
        <boxGeometry args={[boundaryWidth, boundaryHeight, boundaryThickness]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>

      {/* South Wall */}
      <mesh position={[0, boundaryHeight / 2, WORLD_BOUNDS.MIN_Z]} castShadow>
        <boxGeometry args={[boundaryWidth, boundaryHeight, boundaryThickness]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>

      {/* East Wall */}
      <mesh position={[WORLD_BOUNDS.MAX_X, boundaryHeight / 2, 0]} castShadow>
        <boxGeometry args={[boundaryThickness, boundaryHeight, boundaryWidth]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>

      {/* West Wall */}
      <mesh position={[WORLD_BOUNDS.MIN_X, boundaryHeight / 2, 0]} castShadow>
        <boxGeometry args={[boundaryThickness, boundaryHeight, boundaryWidth]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>

      {/* Tree Clusters */}
      {environmentalObjects.treeClusters.map((cluster, i) => (
        <TreeCluster
          key={`tree-${i}`}
          center={cluster.center}
          count={cluster.count}
          radius={cluster.radius}
          seed={cluster.seed}
        />
      ))}

      {/* Rocks */}
      {environmentalObjects.rocks.map((rock, i) => (
        <Rock key={`rock-${i}`} position={rock.position} seed={rock.seed} />
      ))}

      {/* Boulders */}
      {environmentalObjects.boulders.map((boulder, i) => (
        <Boulder key={`boulder-${i}`} position={boulder.position} seed={boulder.seed} />
      ))}

      {/* Bushes */}
      {environmentalObjects.bushes.map((bush, i) => (
        <Bush key={`bush-${i}`} position={bush.position} seed={bush.seed} size={bush.size} />
      ))}

      {/* Mushrooms */}
      {environmentalObjects.mushrooms.map((mushroom, i) => (
        <Mushroom key={`mushroom-${i}`} position={mushroom.position} seed={mushroom.seed} />
      ))}

      {/* Grass Patches */}
      {environmentalObjects.grassPatches.map((patch, i) => (
        <GrassPatch key={`grass-${i}`} position={patch.position} seed={patch.seed} />
      ))}

      {/* Campfire near tavern */}
      <Campfire position={[8, 0, 8]} />

      {/* Fence around the farm */}
      <Fence
        corners={[
          [-50, 0, 20],
          [-30, 0, 20],
          [-30, 0, 40],
          [-50, 0, 40],
        ]}
        height={1.5}
        postsPerSegment={4}
      />
    </>
  );
}
