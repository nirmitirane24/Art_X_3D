import React, { useRef, useEffect } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';

const geometries = {
    cube: new THREE.BoxGeometry(1, 1, 1),
    box: new THREE.BoxGeometry(1, 1, 1),
    sphere: new THREE.SphereGeometry(0.5, 32, 32),
    cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
    cone: new THREE.ConeGeometry(0.5, 1, 32),
    torus: new THREE.TorusGeometry(0.5, 0.2, 16, 100),
    plane: new THREE.PlaneGeometry(1, 1),
    ring: new THREE.RingGeometry(0.3, 0.5, 32),
    dodecahedron: new THREE.DodecahedronGeometry(0.5),
    tetrahedron: new THREE.TetrahedronGeometry(0.5),
    octahedron: new THREE.OctahedronGeometry(0.5),
    icosahedron: new THREE.IcosahedronGeometry(0.5),
    capsule: new THREE.CapsuleGeometry(0.25, 0.5, 4, 16),
    lathe: new THREE.LatheGeometry(
        [
            new THREE.Vector2(0, -0.25),
            new THREE.Vector2(0.25, 0),
            new THREE.Vector2(0, 0.25),
        ].map((p) => new THREE.Vector2(p.x, p.y)),
        8, // Fewer segments
        0,
        Math.PI * 2
    ),
    polyhedron: new THREE.PolyhedronGeometry(
        [
            new THREE.Vector3(0, 0.25, 0),
            new THREE.Vector3(0.2165, -0.125, 0),
            new THREE.Vector3(-0.2165, -0.125, 0),
            new THREE.Vector3(0, 0, 0.25),
        ].map((p) => new THREE.Vector3(p.x, p.y, p.z)),
        [0, 1, 2, 0, 3, 1, 1, 3, 2, 2, 3, 0],
        0.5, // Reduced radius
        0   // Detail set to 0
    ),
};

const materials = {
    standard: new THREE.MeshStandardMaterial({ color: 'white' }),
    // Add more materials with different properties here
};

const Model = ({ object, isSelected, setCameraEnabled, onSelect, onUpdateObject }) => {
    const transformRef = useRef();
    const meshRef = useRef();

    useEffect(() => {
        const handleTransformChange = () => {
            if (meshRef.current && transformRef.current && transformRef.current.dragging) {
                const { position, rotation, scale } = meshRef.current;
                onUpdateObject(object.id, {
                    position: position.toArray(),
                    rotation: [rotation.x, rotation.y, rotation.z],
                    scale: scale.toArray()
                });
            }
        };

        const handleTransformDragEnd = () => {
            if (meshRef.current) {
                const { position, rotation, scale } = meshRef.current;
                onSelect([object.id]); // Update properties when dragging stops
                onUpdateObject(object.id, {
                    position: position.toArray(),
                    rotation: [rotation.x, rotation.y, rotation.z],
                    scale: scale.toArray()
                });
            }
        };

        if (isSelected && transformRef.current) {
            transformRef.current.attach(meshRef.current);
            transformRef.current.addEventListener('objectChange', handleTransformChange);
            transformRef.current.addEventListener('dragging-changed', handleTransformDragEnd);
        } else if (transformRef.current) {
            transformRef.current.detach();
            transformRef.current.removeEventListener('objectChange', handleTransformChange);
            transformRef.current.removeEventListener('dragging-changed', handleTransformDragEnd);
        }

        return () => {
            if (transformRef.current) {
                transformRef.current.removeEventListener('objectChange', handleTransformChange);
                transformRef.current.removeEventListener('dragging-changed', handleTransformDragEnd);
            }
        };
    }, [isSelected, object, onSelect, onUpdateObject]);

    const handlePointerDown = (event) => {
        event.stopPropagation();
        onSelect([object.id]);
        setCameraEnabled(false);
    };

    // Function to create geometry element based on type
    const createGeometryElement = (type) => {
        switch (type) {
            case 'cube':
            case 'box':
                return <boxGeometry args={[1, 1, 1]} />;
            case 'sphere':
                return <sphereGeometry args={[0.5, 32, 32]} />;
            case 'cylinder':
                return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
            case 'cone':
                return <coneGeometry args={[0.5, 1, 32]} />;
            case 'torus':
                return <torusGeometry args={[0.5, 0.2, 16, 100]} />;
            case 'plane':
                return <planeGeometry args={[1, 1]} />;
            case 'ring':
                return <ringGeometry args={[0.3, 0.5, 32]} />;
            case 'dodecahedron':
                return <dodecahedronGeometry args={[0.5]} />;
            case 'tetrahedron':
                return <tetrahedronGeometry args={[0.5]} />;
            case 'octahedron':
                return <octahedronGeometry args={[0.5]} />;
            case 'icosahedron':
                return <icosahedronGeometry args={[0.5]} />;
            case 'capsule':
                return <capsuleGeometry args={[0.25, 0.5, 4, 16]} />;
            case 'lathe':
                return <latheGeometry args={[[
                    new THREE.Vector2(0, -0.25),
                    new THREE.Vector2(0.25, 0),
                    new THREE.Vector2(0, 0.25),
                ].map((p) => new THREE.Vector2(p.x, p.y)), 8, 0, Math.PI * 2]} />;
            case 'polyhedron':
                return <polyhedronGeometry args={[[
                    new THREE.Vector3(0, 0.25, 0),
                    new THREE.Vector3(0.2165, -0.125, 0),
                    new THREE.Vector3(-0.2165, -0.125, 0),
                    new THREE.Vector3(0, 0, 0.25),
                ].map((p) => new THREE.Vector3(p.x, p.y, p.z)), [0, 1, 2, 0, 3, 1, 1, 3, 2, 2, 3, 0], 0.5, 0]} />;
            default:
                return null;
        }
    };

    return (
        <>
            {isSelected && (
                <TransformControls
                    ref={transformRef}
                    mode="translate"
                    space="world"
                />
            )}
            <mesh
                ref={meshRef}
                position={object.position}
                rotation={object.rotation}
                scale={object.scale}
                onPointerDown={handlePointerDown}
            >
                {createGeometryElement(object.type)}
                <meshStandardMaterial color={'gray'} />
            </mesh>
        </>
    );
};

export default Model;