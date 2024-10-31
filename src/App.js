// App.js
import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { Physics, Debug } from '@react-three/cannon';
import PlaneModel from './PlaneModel';
import CockpitCamera from './CockpitCamera';
import FollowBehindCamera from './FollowBehindCamera';
import Ground from './Ground';
import Boundary from './Boundary';
import BoundaryVisual from './BoundaryVisual';
import PlaneParameterDisplay from './PlaneParameterDisplay';

function App() {
  const planeRef = useRef();
  const [planeApi, setPlaneApi] = useState(null);
  const forcesRef = useRef({
    lift: [0, 0, 0],
    drag: [0, 0, 0],
    thrust: [0, 0, 0],
    torque: [0, 0, 0],
  });
  const [activeCamera, setActiveCamera] = useState('follow');

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        setActiveCamera((prev) => (prev === 'follow' ? 'cockpit' : 'follow'));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <>
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        camera={{ position: [0, 25, 15], fov: 60, near: 0.1, far: 2000 }}
        shadows
      >
        <axesHelper args={[10]} />
        <ambientLight intensity={0.3} />
        <directionalLight
          castShadow
          position={[100, 100, 50]}
          intensity={1}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Sky sunPosition={[100, 20, 100]} />

        <Physics gravity={[0, -9.81, 0]} step="fixed" iterations={10}>
          <Debug color="black" scale={1.1}>
            <PlaneModel
              ref={planeRef}
              onApiReady={setPlaneApi}
              position={[0, 20, 0]}
              forcesRef={forcesRef}
            />
            <Ground heightMapUrl={"/heightmap.png"} />
            <Boundary position={[0, 0, -1000]} rotation={[0, 0, 0]} />
            <Boundary position={[0, 0, 1000]} rotation={[0, Math.PI, 0]} />
            <Boundary position={[-1000, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
            <Boundary position={[1000, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
          </Debug>
        </Physics>

        <BoundaryVisual />
        <CockpitCamera planeApi={planeApi} makeDefault={activeCamera === 'cockpit'} />
        <FollowBehindCamera planeApi={planeApi} makeDefault={activeCamera === 'follow'} />
      </Canvas>

      {planeApi && <PlaneParameterDisplay planeApi={planeApi} forcesRef={forcesRef} />}
    </>
  );
}

export default App
