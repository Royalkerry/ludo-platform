import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import LudoBoard from "./LudoBoard";

export default function Board3D() {
  const [zoom, setZoom] = useState(45);

  useEffect(() => {
    const updateZoom = () => {
      const width = window.innerWidth;
      if (width < 500) setZoom(18);       // Mobile
      else if (width < 900) setZoom(30);  // Tablet
      else setZoom(45);                   // Desktop
    };

    updateZoom();
    window.addEventListener("resize", updateZoom);
    return () => window.removeEventListener("resize", updateZoom);
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", backgroundColor: "#111" }}>
      <Canvas orthographic>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.4} />

        {/* Orthographic (Top-down) Camera */}
        <OrthographicCamera
          makeDefault
          position={[0, 0, 100]}
          zoom={zoom}
        />

        {/* Ludo King Style Board */}
        <LudoBoard />
      </Canvas>
    </div>
  );
}
