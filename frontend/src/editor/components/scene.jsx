// src/components/Scene.jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import GroundPlane from './GroundPlane';
import CameraControls from './cameraControls.jsx';
import Model from './model.jsx';

const Scene = ({ models, setCameraEnabled }) => {
    return (
        <div style={{justifyContent:'center'}}>
        <Canvas style={{ height: '100vh', width: '100vw', backgroundColor:'black' }}>
            <ambientLight intensity={10} />
            <pointLight position={[10, 10, 10]} />
            <gridHelper args={[10, 10]} />
            <GroundPlane />
            <CameraControls enabled={setCameraEnabled} />
            {models.map((model, index) => (
                <Model key={index} type={model.type} position={model.position} setCameraEnabled={setCameraEnabled} />
            ))}
        </Canvas>
        </div>
    );
};

export default Scene;