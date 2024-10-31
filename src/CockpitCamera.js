// CockpitCamera.jsx
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function CockpitCamera({ planeApi, makeDefault }) {
  const cameraRef = useRef();
  const planePosition = useRef([0, 0, 0]);
  const planeQuaternion = useRef([0, 0, 0, 1]);

  useEffect(() => {
    if (!planeApi) return;

    const unsubscribePosition = planeApi.position.subscribe((position) => {
      planePosition.current = position;
    });

    const unsubscribeQuaternion = planeApi.quaternion.subscribe((quaternion) => {
      planeQuaternion.current = quaternion;
    });

    return () => {
      unsubscribePosition();
      unsubscribeQuaternion();
    };
  }, [planeApi]);

  useFrame(() => {
    if (!cameraRef.current) return;

    const [px, py, pz] = planePosition.current;
    const [qx, qy, qz, qw] = planeQuaternion.current;
    
    const cockpitOffset = new THREE.Vector3(0, -2, -2);

    const initialRotation = new THREE.Euler(Math.PI / 2, Math.PI, 0);
    const initialQuaternion = new THREE.Quaternion().setFromEuler(initialRotation);
    const planeQuat = new THREE.Quaternion(qx, qy, qz, qw);

    const finalQuat = planeQuat.multiply(initialQuaternion);
    const offsetPosition = cockpitOffset.clone().applyQuaternion(finalQuat);

    cameraRef.current.position.set(
      px + offsetPosition.x,
      py + offsetPosition.y,
      pz + offsetPosition.z
    );

    cameraRef.current.quaternion.copy(finalQuat);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault={makeDefault}
      fov={75}
      near={0.1}
      far={1000}
    />
  );
}

export default CockpitCamera;
