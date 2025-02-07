import React from 'react';
import * as THREE from 'three';
 
const GroundPlane = () => {
    return (
        <mesh
            rotation-x={-Math.PI / 2}
            position={[0, 0, 0]}
            receiveShadow
        >
            <planeGeometry args={[10, 10]} />
            <meshBasicMaterial color="black" side={THREE.DoubleSide} />
        </mesh>
    );
};
 
export default GroundPlane;