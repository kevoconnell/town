'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Euler } from 'three';
import * as THREE from 'three';

interface ThirdPersonCameraProps {
  targetRef: React.RefObject<THREE.Group>;
}

export default function ThirdPersonCamera({ targetRef }: ThirdPersonCameraProps) {
  const { camera } = useThree();
  const cameraRotationRef = useRef({ horizontal: 0, vertical: 0.3 });
  const isDraggingRef = useRef(false);
  const smoothedPositionRef = useRef(new Vector3(0, 5, 10));
  const smoothedLookAtRef = useRef(new Vector3(0, 0, 0));

  // Camera settings
  const cameraDistance = 8;
  const cameraHeight = 3;
  const minVerticalAngle = -0.5;
  const maxVerticalAngle = 1.2;
  const cameraSmoothness = 0.1;

  useEffect(() => {
    const handleMouseDown = () => {
      isDraggingRef.current = true;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const sensitivity = 0.003;
        cameraRotationRef.current.horizontal -= e.movementX * sensitivity;
        cameraRotationRef.current.vertical = Math.max(
          minVerticalAngle,
          Math.min(maxVerticalAngle, cameraRotationRef.current.vertical - e.movementY * sensitivity)
        );
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useFrame(() => {
    if (!targetRef.current) return;

    const target = targetRef.current;
    const targetPosition = target.position;

    // Calculate camera position based on rotation around player
    const horizontalAngle = cameraRotationRef.current.horizontal;
    const verticalAngle = cameraRotationRef.current.vertical;

    const cameraOffset = new Vector3(
      Math.sin(horizontalAngle) * cameraDistance * Math.cos(verticalAngle),
      cameraHeight + Math.sin(verticalAngle) * cameraDistance,
      Math.cos(horizontalAngle) * cameraDistance * Math.cos(verticalAngle)
    );

    const desiredCameraPosition = new Vector3().addVectors(targetPosition, cameraOffset);
    const lookAtPosition = new Vector3(targetPosition.x, targetPosition.y + 1.5, targetPosition.z);

    // Smooth camera movement
    smoothedPositionRef.current.lerp(desiredCameraPosition, cameraSmoothness);
    smoothedLookAtRef.current.lerp(lookAtPosition, cameraSmoothness);

    camera.position.copy(smoothedPositionRef.current);
    camera.lookAt(smoothedLookAtRef.current);

    // Update player's rotation reference based on camera rotation
    // This allows movement to be relative to camera view
    if (target.userData) {
      target.userData.cameraRotation = horizontalAngle;
    }
  });

  return null;
}

export function getCameraRotation(targetRef: React.RefObject<THREE.Group>): number {
  return targetRef.current?.userData.cameraRotation || 0;
}
