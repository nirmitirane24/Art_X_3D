import React, { useRef, useEffect, useState } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useLoader, useFrame } from '@react-three/fiber';

// Predefined Geometries (no changes needed)
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


const Model = ({ object, isSelected, setCameraEnabled, onSelect, onUpdateObject }) => {
    const transformRef = useRef();
    const meshRef = useRef();
    const [material, setMaterial] = useState(null);
    const [texture, setTexture] = useState(null);

    const handlePointerDown = (event) => {
        event.stopPropagation();
        onSelect([object.id]);
        setCameraEnabled(false);
    };


  useEffect(() => {
        if (object.material) {
            const newMaterial = new THREE.MeshStandardMaterial({
                color: object.material.color || '#ffffff',
                metalness: object.material.metalness || 0,
                roughness: object.material.roughness || 0.5,
                 map: texture,
            });

            setMaterial(newMaterial);

            return () => {
              if(newMaterial)
                newMaterial.dispose()
            }
        }
        
    },[object.material, texture]);

    useEffect(() => {
        if (object.material && object.material.texture) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const textureLoader = new THREE.TextureLoader();
            const loadedTexture = textureLoader.load(e.target.result);
            setTexture(loadedTexture);
          };
            reader.readAsDataURL(object.material.texture)
        }
    }, [object.material && object.material.texture]);
    

    useFrame(() => {
       if (meshRef.current) {
            meshRef.current.position.set(...object.position);
            meshRef.current.rotation.set(...object.rotation);
            meshRef.current.scale.set(...object.scale);

            if(material) {
                meshRef.current.material = material;
                if(object.material && object.material.custom !== undefined && meshRef.current.material.userData) {
                    meshRef.current.material.userData.custom = object.material.custom;
                    meshRef.current.material.needsUpdate = true;
                }
            }
        }
    });

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
                onSelect([object.id]);
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
                 onPointerDown={handlePointerDown}
            >
             {geometries[object.type] ? <primitive object={geometries[object.type]} attach="geometry" /> : null}
             
            </mesh>
        </>
    );
};

export default Model;