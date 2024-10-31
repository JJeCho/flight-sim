// PlaneParameterDisplay.js
import React, { useEffect, useState } from 'react';
import { Quaternion, Euler } from 'three';

function PlaneParameterDisplay({ planeApi, forcesRef }) {
    const [position, setPosition] = useState([0, 0, 0]);
    const [velocity, setVelocity] = useState([0, 0, 0]);
    const [quaternion, setQuaternion] = useState([0, 0, 0, 1]);
    const [forces, setForces] = useState({
      lift: [0, 0, 0],
      drag: [0, 0, 0],
      thrust: [0, 0, 0],
      torque: [0, 0, 0],
    });
  
    useEffect(() => {
      if (!planeApi) return;
  
      const unsubscribePosition = planeApi.position.subscribe(setPosition);
      const unsubscribeVelocity = planeApi.velocity.subscribe(setVelocity);
      const unsubscribeQuaternion = planeApi.quaternion.subscribe(setQuaternion);
  
      return () => {
        unsubscribePosition();
        unsubscribeVelocity();
        unsubscribeQuaternion();
      };
    }, [planeApi]);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setForces({ ...forcesRef.current });
      }, 100);
  
      return () => clearInterval(interval);
    }, [forcesRef]);
  

  const speed = Math.sqrt(
    velocity[0] ** 2 + velocity[1] ** 2 + velocity[2] ** 2
  );

  const [qx, qy, qz, qw] = quaternion;
  const quaternionObj = new Quaternion(qx, qy, qz, qw);
  const euler = new Euler().setFromQuaternion(quaternionObj, 'ZYX');

  const pitch = euler.x * (180 / Math.PI);
  const yaw = euler.y * (180 / Math.PI);
  const tilt = euler.z * (180 / Math.PI);

  return (
    <div style={styles.container}>
      <p>
        <strong>Position:</strong> x: {position[0].toFixed(2)}, y:{' '}
        {position[1].toFixed(2)}, z: {position[2].toFixed(2)}
      </p>
      <p>
        <strong>Speed:</strong> {speed.toFixed(2)} m/s
      </p>
      <p>
        <strong>Pitch:</strong> {pitch.toFixed(2)}°
      </p>
      <p>
        <strong>Yaw:</strong> {yaw.toFixed(2)}°
      </p>
      <p>
        <strong>Tilt:</strong> {tilt.toFixed(2)}°
      </p>
      <p>
        <strong>Lift Force:</strong> x: {forces.lift[0].toFixed(2)}, y:{' '}
        {forces.lift[1].toFixed(2)}, z: {forces.lift[2].toFixed(2)}
      </p>
      <p>
        <strong>Drag Force:</strong> x: {forces.drag[0].toFixed(2)}, y:{' '}
        {forces.drag[1].toFixed(2)}, z: {forces.drag[2].toFixed(2)}
      </p>
      <p>
        <strong>Thrust Force:</strong> x: {forces.thrust[0].toFixed(2)}, y:{' '}
        {forces.thrust[1].toFixed(2)}, z: {forces.thrust[2].toFixed(2)}
      </p>
      <p>
        <strong>Torque:</strong> x: {forces.torque[0].toFixed(2)}, y:{' '}
        {forces.torque[1].toFixed(2)}, z: {forces.torque[2].toFixed(2)}
      </p>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 10,
    left: 10,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: '10px',
    borderRadius: '5px',
    fontFamily: 'Arial, sans-serif',
    zIndex: 1,
  },
};

export default PlaneParameterDisplay;
