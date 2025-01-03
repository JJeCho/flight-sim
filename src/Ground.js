import React, { useRef, useEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'

function Ground({ url = '/heightmap.png' }) {
  const geometryRef = useRef()

  // Load heightmap as a texture
  const heightMap = useLoader(THREE.TextureLoader, url)

  useEffect(() => {
    if (!heightMap?.image) return

    // Create an offscreen canvas to access pixel data
    const image = heightMap.image
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)
    
    // Extract pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Access our plane geometry
    const geometry = geometryRef.current
    if (!geometry) return

    const positions = geometry.attributes.position.array
    const widthSegments = geometry.parameters.widthSegments
    const heightSegments = geometry.parameters.heightSegments

    // The plane has (widthSegments+1)*(heightSegments+1) vertices.
    // Rows and cols reflect the vertex grid count.
    const rows = heightSegments + 1
    const cols = widthSegments + 1

    // Loop through all vertices in the plane
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        // Each vertex has an x, y, z => 3 positions
        const vertexIndex = (i * cols + j) * 3

        // Map the vertex to a pixel in the image
        // (j / (cols - 1)) and (i / (rows - 1)) go from 0 -> 1 across width/height
        const x = Math.floor((j / (cols - 1)) * (canvas.width - 1))
        const y = Math.floor((i / (rows - 1)) * (canvas.height - 1))

        // Each pixel has 4 components: RGBA
        const pixelIndex = (y * canvas.width + x) * 4
        const r = imageData.data[pixelIndex]
        const g = imageData.data[pixelIndex + 1]
        const b = imageData.data[pixelIndex + 2]
        // Optionally, you could also use the alpha channel at imageData.data[pixelIndex + 3]

        // Convert color to a grayscale value
        const gray = (r + g + b) / 3

        // Scale the height (adjust as needed)
        const heightValue = (gray / 255) * 100

        // Update the plane’s Z coordinate
        positions[vertexIndex + 2] = heightValue
      }
    }

    // Inform Three.js that positions changed
    geometry.attributes.position.needsUpdate = true
    // Recalculate normals for correct lighting
    geometry.computeVertexNormals()
  }, [heightMap])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      {/* 
        Create a plane geometry with enough subdivisions to accurately represent 
        the heightmap. Increasing segments yields a more detailed mesh.
      */}
      <planeGeometry ref={geometryRef} args={[2000, 2000, 256, 256]} />
      <meshStandardMaterial color="lightgreen" wireframe={false} />
    </mesh>
  )
}

export default Ground
