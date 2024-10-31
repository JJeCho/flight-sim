// ForceVisualizer.jsx
import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { ArrowHelper, Vector3 } from 'three';

function ForceVisualizer({ force, position = [0, 0, 0], color = 0x00ff00 }) {
  const { scene } = useThree();

  useEffect(() => {
    if (!force) return;

    const dir = new Vector3(force.x, force.y, force.z).normalize();
    const length = new Vector3(force.x, force.y, force.z).length() * 0.005;
    if (length === 0) return;

    const arrow = new ArrowHelper(dir, new Vector3(...position), length, color);
    scene.add(arrow);

    return () => {
      scene.remove(arrow);
    };
  }, [force, position, scene, color]);

  return null;
}

export default ForceVisualizer;
