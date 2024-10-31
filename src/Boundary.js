// Boundaries.jsx
import React from 'react';
import { usePlane } from '@react-three/cannon';

function Boundary({ position, rotation }) {
  const [ref] = usePlane(() => ({
    position,
    rotation,
    type: 'Static',
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial visible={false} />
    </mesh>
  );
}

export default Boundary;
