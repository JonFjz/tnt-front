// src/components/KeplerOBJ.jsx
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Environment } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { Suspense, useMemo } from "react";

function KeplerModel({ scale = 1 }) {
  const materials = useLoader(MTLLoader, "/models/kepler_satellite.mtl", (loader) => {
    loader.resourcePath = "/models/"; // resolve texture paths
  });

  const object = useLoader(
    OBJLoader,
    "/models/kepler_satellite.obj",
    (loader) => materials && loader.setMaterials(materials)
  );

  // Slight cleanup to ensure cast/receive shadows etc.
  useMemo(() => {
    object.traverse((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
    });
  }, [object]);

  return <primitive object={object} scale={scale} />;
}

export default function KeplerOBJ() {
  return (
    <div className="kepler3d">
      <Canvas
        camera={{ position: [0.6, 0.3, 2.2], fov: 45 }}
        dpr={[1, 2]}
        shadows
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 2, 3]} intensity={1.2} castShadow />
        <Suspense fallback={null}>
          {/* Float makes it gently hover & rotate */}
          <Float speed={0.6} rotationIntensity={0.6} floatIntensity={0.6}>
            <KeplerModel scale={1} />
          </Float>
          <Environment preset="night" />
        </Suspense>
        {/* Keep controls disabled for zoom/pan so it feels like a hero prop */}
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.25} />
      </Canvas>
    </div>
  );
}
