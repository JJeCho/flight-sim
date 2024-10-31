import React, { useRef, useEffect, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { useHeightfield } from '@react-three/cannon';
import * as THREE from 'three';

function Ground({ heightMapUrl }) {
  const heightMap = useLoader(THREE.TextureLoader, heightMapUrl);
  const ref = useRef();
  const physicsRef = useRef();

  const heightMultiplier = 15;

  const [heightMatrix, elementSize, planeWidth, planeHeight] = useMemo(() => {
    if (!heightMap || !heightMap.image) return [[], 1, 1, 1];

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const width = heightMap.image.width;
    const height = heightMap.image.height;

    canvas.width = width;
    canvas.height = height;
    context.drawImage(heightMap.image, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    const matrix = [];

    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const heightValue = pixels[pixelIndex] / 255;
        row.push(heightValue * heightMultiplier);
      }
      matrix.push(row);
    }

    const planeHeight = 1000;
    const imageAspectRatio = width / height;
    const planeWidth = planeHeight * imageAspectRatio;

    const elementSize = planeWidth / (width - 1);

    return [matrix, elementSize, planeWidth, planeHeight];
  }, [heightMap]);

  const [heightfieldRef] = useHeightfield(
    () => ({
      args: [heightMatrix, { elementSize }],
      rotation: [Math.PI / 2, 0, 0],
      position: [-500, 0, -500],
      type: 'Static',
    }),
    physicsRef
  );

  useEffect(() => {
    if (!ref.current || !heightMap.image) return;

    const geometry = ref.current;
    const image = heightMap.image;

    const widthSegments = geometry.parameters.widthSegments;
    const heightSegments = geometry.parameters.heightSegments;

    const vertices = geometry.attributes.position.array;
    const colors = [];

    const width = image.width;
    const height = image.height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    for (let i = 0, j = 0; i < vertices.length; i += 3, j++) {
      const xi = j % (widthSegments + 1);
      const yi = Math.floor(j / (widthSegments + 1));

      const xImg = Math.floor((xi / widthSegments) * (width - 1));
      const yImg = Math.floor((yi / heightSegments) * (height - 1));

      const pixelIndex = (yImg * width + xImg) * 4;
      const heightValue = pixels[pixelIndex] / 255;

      vertices[i + 1] = heightValue * heightMultiplier;

      const darkGreen = [0.0, 0.392, 0.0];
      const lightGreen = [0.565, 0.933, 0.565];

      const colorR = darkGreen[0] + heightValue * (lightGreen[0] - darkGreen[0]);
      const colorG = darkGreen[1] + heightValue * (lightGreen[1] - darkGreen[1]);
      const colorB = darkGreen[2] + heightValue * (lightGreen[2] - darkGreen[2]);

      colors.push(colorR, colorG, colorB);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }, [heightMap, ref]);

  return (
    <>
      <mesh ref={heightfieldRef} position={[0, 0, 0]}>
        <planeGeometry args={[planeWidth, planeHeight, 256, 256]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <planeGeometry ref={ref} args={[planeWidth, planeHeight, 256, 256]} />
        <meshStandardMaterial vertexColors />
      </mesh>
    </>
  );
}

export default Ground;
