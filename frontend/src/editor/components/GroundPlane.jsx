// src/components/GroundPlane.jsx
import React from 'react';

const GroundPlane = () => {
    return (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="lightgray" />
        </mesh>
    );
};

export default GroundPlane;