// PlaneModel.js
import { useBox } from '@react-three/cannon';
import { useGLTF } from '@react-three/drei';
import React, { forwardRef, useEffect } from 'react';
import { AxesHelper } from 'three';
import FlightPhysics from './FlightPhysics';
import PlaneControls from './PlaneControls';

const PlaneModel = forwardRef(({ onApiReady,forcesRef, ...props }, ref) => {
  const { nodes, materials } = useGLTF('/models/scene.gltf');

  const [planeRef, api] = useBox(() => ({
    mass: 1,
    position: [0, 1, 0],
    rotation: [Math.PI / 2, Math.PI, 0],
    args: [2.5, 3, 1.5],
    linearDamping: 0.02,
    angularDamping: 0.1,
    allowSleep: true,
    sleepSpeedLimit: 0.1,
    sleepTimeLimit: 1,
    ...props,
  }));

  useEffect(() => {
    if (ref) ref.current = planeRef.current;
  }, [planeRef, ref]);

  useEffect(() => {
    if (onApiReady && api) {
      onApiReady(api);
    }
  }, [api, onApiReady]);


  useEffect(() => {
    api.velocity.set(0, 0, 0);
    api.angularVelocity.set(0, 0, 0);
  }, [api]);

  useEffect(() => {
    if (!planeRef.current) return;
    const axesHelper = new AxesHelper(5);
    planeRef.current.add(axesHelper);
    return () => {
      if (planeRef.current) {
        planeRef.current.remove(axesHelper);
      }
    };
  }, [planeRef]);

  return (
    <group>
      <group ref={planeRef} dispose={null}>
        <mesh geometry={nodes.Object_2.geometry} material={materials.Airplane} />
        <mesh geometry={nodes.Object_3.geometry} material={materials.Airplane} />
        <FlightPhysics planeApi={api} forcesRef={forcesRef}/>
        <PlaneControls planeApi={api} forcesRef={forcesRef} />
      </group>
    </group>
  );
});

export default PlaneModel;
