// FlightPhysics.js
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Quaternion, Vector3 } from 'three';

function FlightPhysics({ planeApi, forcesRef }) {
  const velocity = useRef([0, 0, 0]);
  const angularVelocity = useRef([0, 0, 0]);
  const quaternion = useRef(new Quaternion());

  useEffect(() => {
    if (!planeApi) return;
    const unsubscribeVelocity = planeApi.velocity.subscribe((v) => (velocity.current = v));
    return () => unsubscribeVelocity();
  }, [planeApi]);

  useEffect(() => {
    if (!planeApi) return;
    const unsubscribeAngularVelocity = planeApi.angularVelocity.subscribe(
      (v) => (angularVelocity.current = v)
    );
    return () => unsubscribeAngularVelocity();
  }, [planeApi]);

  useEffect(() => {
    if (!planeApi) return;
    const unsubscribeQuaternion = planeApi.quaternion.subscribe((q) => {
      quaternion.current.set(q[0], q[1], q[2], q[3]);
    });
    return () => unsubscribeQuaternion();
  }, [planeApi]);

  useFrame(() => {
    if (!planeApi) return;

    const [vx, vy, vz] = velocity.current;
    let speed = Math.hypot(vx, vy, vz);
    const velocityVector = new Vector3(vx, vy, vz);

    const maxSpeed = 1000;
    if (speed > maxSpeed || isNaN(speed)) {
      const scaleFactor = maxSpeed / speed;
      planeApi.velocity.set(vx * scaleFactor, vy * scaleFactor, vz * scaleFactor);
      speed = maxSpeed;
    }

    const planeQuaternion = quaternion.current.clone();
    const invQuaternion = planeQuaternion.clone().invert();

    const relativeAirflow = velocityVector.clone().multiplyScalar(-1);

    const airflowLocal = relativeAirflow.clone().applyQuaternion(invQuaternion);

    const forwardLocal = new Vector3(0, 0, 1);

    const aoa = forwardLocal.angleTo(airflowLocal);

    const cross = new Vector3().crossVectors(forwardLocal, airflowLocal);
    const sign = Math.sign(cross.x);
    const aoaSigned = aoa * sign;

    const liftCoefficient = computeLiftCoefficient(aoaSigned);

    const airDensity = 1.225;
    const wingArea = 10; 
    const liftForceMagnitude = 0.5 * airDensity * speed ** 2 * wingArea * liftCoefficient;

    const liftDirectionLocal = new Vector3(0, 1, 0);

    const liftForceLocal = liftDirectionLocal.multiplyScalar(liftForceMagnitude);

    const liftForceWorld = liftForceLocal.clone().applyQuaternion(planeQuaternion);

    planeApi.applyForce([liftForceWorld.x, liftForceWorld.y, liftForceWorld.z], [0, 0, 0]);

    const dragCoefficient = computeDragCoefficient(aoaSigned);

    const dragForceMagnitude = 0.5 * airDensity * speed ** 2 * wingArea * dragCoefficient;

    const dragDirectionLocal = airflowLocal.clone().normalize();

    const dragForceLocal = dragDirectionLocal.multiplyScalar(dragForceMagnitude);

    const dragForceWorld = dragForceLocal.clone().applyQuaternion(planeQuaternion);

    planeApi.applyForce([dragForceWorld.x, dragForceWorld.y, dragForceWorld.z], [0, 0, 0]);
    forcesRef.current.lift = [liftForceWorld.x, liftForceWorld.y, liftForceWorld.z];
    forcesRef.current.drag = [dragForceWorld.x, dragForceWorld.y, dragForceWorld.z];

    const [avx, avy, avz] = angularVelocity.current;
    const angularVelocityVector = new Vector3(avx, avy, avz);
    const angularDamping = angularVelocityVector.clone().multiplyScalar(-0.1);
    planeApi.applyTorque([angularDamping.x, angularDamping.y, angularDamping.z]);
  });

  function computeLiftCoefficient(aoa) {
    const stallAngle = (15 * Math.PI) / 180;
    const maxLiftCoefficient = 1.0;

    if (Math.abs(aoa) < stallAngle) {
      return (maxLiftCoefficient / stallAngle) * aoa;
    } else {
      const stallLiftCoefficient = maxLiftCoefficient;
      return (
        stallLiftCoefficient *
        (1 - (Math.abs(aoa) - stallAngle) / (Math.PI / 2 - stallAngle)) *
        Math.sign(aoa)
      );
    }
  }

  function computeDragCoefficient(aoa) {
    const baseDragCoefficient = 0.02;
    const inducedDragFactor = 0.1;

    return baseDragCoefficient + inducedDragFactor * aoa ** 2;
  }

  return null;
}

export default FlightPhysics;
