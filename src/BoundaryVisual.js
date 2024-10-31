// BoundaryVisual.jsx
import React from 'react';

function BoundaryVisual() {
  return (
    <>
      <mesh position={[0, 0, -500]}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>
      <mesh position={[0, 0, 500]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>
      <mesh position={[-500, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>
      <mesh position={[500, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>
    </>
  );
}

export default BoundaryVisual;
