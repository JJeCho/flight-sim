// PlaneControls.js
import { useFrame } from '@react-three/fiber';
import { useState, useEffect, useRef } from 'react';
import { Quaternion, Vector3 } from 'three';
import ForceVisualizer from './ForceVisualizer';

function PlaneControls({ planeApi, forcesRef }) {
  const [keysPressed, setKeysPressed] = useState({});
  const [throttle, setThrottle] = useState(0);
  const maxThrottle = 5;
  const maxThrust = 1000;
  const throttleChangeRate = 1.5;
  const quaternionRef = useRef(new Quaternion());
  const [appliedThrust, setAppliedThrust] = useState(null);

  const pitchSensitivity = 1.2;
  const tiltSensitivity = 1.6;
  const yawSensitivity = 0.8;

  const handleKeyDown = (e) => {
    setKeysPressed((keys) => ({ ...keys, [e.code]: true }));
  };

  const handleKeyUp = (e) => {
    setKeysPressed((keys) => ({ ...keys, [e.code]: false }));
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!planeApi) return;
    const unsubscribe = planeApi.quaternion.subscribe((q) => {
      quaternionRef.current.set(q[0], q[1], q[2], q[3]);
    });
    return () => unsubscribe();
  }, [planeApi]);

  useFrame((state, delta) => {
    if (!planeApi) return;

    if (keysPressed['KeyW']) {
      setThrottle((prev) => Math.min(prev + throttleChangeRate * delta, maxThrottle));
    }
    if (keysPressed['KeyS']) {
      setThrottle((prev) => Math.max(prev - throttleChangeRate * delta, 0));
    }

    let pitchInput = 0;
    let yawInput = 0;
    let tiltInput = 0;

    if (keysPressed['ArrowUp']) pitchInput = 1;
    if (keysPressed['ArrowDown']) pitchInput = -1;
    if (keysPressed['ArrowLeft']) yawInput = -1;
    if (keysPressed['ArrowRight']) yawInput = 1;
    if (keysPressed['KeyQ']) tiltInput = -1;
    if (keysPressed['KeyE']) tiltInput = 1;

    const planeQuaternion = quaternionRef.current.clone();

    const controlTorque = new Vector3(
      pitchInput * pitchSensitivity,
      tiltInput * tiltSensitivity,
      yawInput * yawSensitivity,
    );

    const torqueWorld = controlTorque.applyQuaternion(planeQuaternion);
    planeApi.applyTorque([torqueWorld.x, torqueWorld.y, torqueWorld.z]);

    forcesRef.current.torque = [torqueWorld.x, torqueWorld.y, torqueWorld.z];

    const originalForward = new Vector3(0, -1, 0);
    const forward = originalForward.applyQuaternion(planeQuaternion).normalize();
    const thrustForceMagnitude = throttle * (maxThrust / maxThrottle);
    const thrustForce = forward.multiplyScalar(thrustForceMagnitude);

    planeApi.applyForce([thrustForce.x, thrustForce.y, thrustForce.z], [0, 0, 0]);

    forcesRef.current.thrust = [thrustForce.x, thrustForce.y, thrustForce.z];
    setAppliedThrust(thrustForce);
  });

  return (
    <>
      <ForceVisualizer force={appliedThrust} position={[0, 0, 0]} color={0x00ff00} />
    </>
  );
}

export default PlaneControls;
