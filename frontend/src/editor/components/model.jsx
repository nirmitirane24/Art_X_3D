// --- START OF FILE Model.jsx ---

import React, { useRef, useEffect, useState } from "react";
import { TransformControls } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const geometries = {
    // ... (geometries remain unchanged) ...
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
        [new THREE.Vector2(0, -0.25), new THREE.Vector2(0.25, 0), new THREE.Vector2(0, 0.25)].map((p) => new THREE.Vector2(p.x, p.y)),
        8,  // Fewer segments
        0,
        Math.PI * 2
    ),
    polyhedron: new THREE.PolyhedronGeometry(
        [
            new THREE.Vector3(0, 0.25, 0),
            new THREE.Vector3(0.2165, -0.125, 0),
            new THREE.Vector3(-0.2165, -0.125, 0),
            new THREE.Vector3(0, 0, 0.25)
        ].map(p => new THREE.Vector3(p.x, p.y, p.z)),
        [0, 1, 2, 0, 3, 1, 1, 3, 2, 2, 3, 0],
        0.5,  // Reduced radius
        0     // Detail set to 0
    )
};

const Model = ({ object, isSelected, onSelect, onUpdateObject }) => {
    const transformRef = useRef();
    const meshRef = useRef();
    const [material, setMaterial] = useState(null);
    const [texture, setTexture] = useState(null);
    const [normalMap, setNormalMap] = useState(null);
    const [meshReady, setMeshReady] = useState(false);
    const [originalMaterials, setOriginalMaterials] = useState({});
    const [mode, setMode] = useState('translate');
    const [isDragging, setIsDragging] = useState(false); // Track dragging state


    useEffect(() => {
        if (object.mesh) {
            meshRef.current = object.mesh;

            const originalMats = {};
            meshRef.current.traverse((child) => {
                if (child.isMesh && child.material) {
                   if (child.material instanceof THREE.Material) {
                        originalMats[child.uuid] = child.material;
                    } else {
                        console.warn("Invalid material for mesh:", child);
                        originalMats[child.uuid] = new THREE.MeshStandardMaterial({ color: 0xffffff });
                    }
                }
            });
            setOriginalMaterials(originalMats);

            meshRef.current.traverse((child) => {
                if (child.isMesh) {
                    applyMaterial(child);
                }
            });
            setMeshReady(true);
        } else {
            setMeshReady(true); // For primitive shapes
        }
    }, [object.mesh]);

    const applyMaterial = (mesh) => {
        let newSide;
        if(object.material.side === 'front'){
            newSide = THREE.FrontSide;
        } else if (object.material.side === 'back'){
            newSide = THREE.BackSide;
        } else if (object.material.side === 'double'){
            newSide = THREE.DoubleSide
        } else {
            newSide = THREE.FrontSide
        }
        let newMaterial;
         if (object.mesh) {
            // For imported meshes, clone the original material if available
            if (originalMaterials[mesh.uuid] && originalMaterials[mesh.uuid].clone) {
                newMaterial = originalMaterials[mesh.uuid].clone();
                 if (object.material && object.material.color && newMaterial.color) {
                    newMaterial.color = new THREE.Color(object.material.color);
                }
                if (object.material && object.material.opacity && newMaterial.opacity) {
                    newMaterial.transparent = object.material.opacity < 1;
                    newMaterial.opacity = object.material.opacity;
                }
                if(object.material && object.material.side){
                    newMaterial.side = newSide
                }
                if (object.material && object.material.wireframe !== undefined) {
                  newMaterial.wireframe = object.material.wireframe;
                }
                 if (object.material && object.material.flatShading !== undefined) {
                   newMaterial.flatShading = object.material.flatShading;
                 }

            } else {
                // Fallback material if original is not clonable or missing
                newMaterial = new THREE.MeshPhysicalMaterial({
                    color: object.material.color || "#ffffff",
                    emissive: object.material.emissive || "#000000",
                    metalness: object.material.metalness || 0,
                    roughness: object.material.roughness || 0.5,
                    map: texture,
                    normalMap: normalMap,
                     opacity: object.material.opacity === undefined ? 1 : object.material.opacity,
                    transparent: object.material.opacity < 1,
                    side: newSide,
                    reflectivity: object.material.reflectivity === undefined ? 0 : object.material.reflectivity,
                    shininess: object.material.shininess === undefined ? 30 : object.material.shininess,
                    ior: object.material.ior === undefined ? 1.5 : object.material.ior,
                    transmission: object.material.transmission === undefined ? 0 : object.material.transmission,
                    clearcoat: object.material.clearcoat === undefined ? 0 : object.material.clearcoat,
                    clearcoatRoughness: object.material.clearcoatRoughness === undefined ? 0 : object.material.clearcoatRoughness,
                    sheen: object.material.sheen === undefined ? 0 : object.material.sheen,
                    sheenRoughness: object.material.sheenRoughness === undefined ? 0 : object.material.sheenRoughness,
                    wireframe: object.material.wireframe || false,
                    flatShading: object.material.flatShading || false,
                    castShadow: object.material.castShadow !== undefined ? object.material.castShadow : false,
                    receiveShadow: object.material.receiveShadow !== undefined ? object.material.receiveShadow : false,
                });
            }
        }else {
            newMaterial = new THREE.MeshPhysicalMaterial({
                color: object.material.color || "#ffffff",
                emissive: object.material.emissive || "#000000",
                metalness: object.material.metalness || 0,
                roughness: object.material.roughness || 0.5,
                map: texture,  // Apply loaded texture
                normalMap: normalMap, // Apply loaded normal map
                opacity: object.material.opacity === undefined ? 1 : object.material.opacity,
                transparent: object.material.opacity < 1,
                side: newSide,
                reflectivity: object.material.reflectivity === undefined ? 0 : object.material.reflectivity,
                shininess: object.material.shininess === undefined ? 30 : object.material.shininess,
                ior: object.material.ior === undefined ? 1.5 : object.material.ior,
                transmission: object.material.transmission === undefined ? 0 : object.material.transmission,
                clearcoat: object.material.clearcoat === undefined ? 0 : object.material.clearcoat,
                clearcoatRoughness: object.material.clearcoatRoughness === undefined ? 0 : object.material.clearcoatRoughness,
                sheen: object.material.sheen === undefined ? 0 : object.material.sheen,
                sheenRoughness: object.material.sheenRoughness === undefined ? 0 : object.material.sheenRoughness,
                thickness: object.material.thickness === undefined ? 0 : object.material.thickness,
                wireframe: object.material.wireframe || false,
                flatShading: object.material.flatShading || false,
                castShadow: object.material.castShadow !== undefined ? object.material.castShadow : false, // Default to false if undefined
                receiveShadow: object.material.receiveShadow !== undefined ? object.material.receiveShadow : false, // Default to false
            });
        }

        mesh.material = newMaterial;
        setMaterial(newMaterial);
    };

    useEffect(() => {
      if (object.material) {
        if(meshRef.current && !object.mesh){
            applyMaterial(meshRef.current);
        } else if (meshRef.current && object.mesh){
             meshRef.current.traverse((child) => {
                if (child.isMesh) {
                    applyMaterial(child);
                }
            });
        }
        return () => {
          if (material) material.dispose();
        };
      }
    }, [object.material, texture, normalMap, originalMaterials]);

    useEffect(() => {
        if(object.material && object.material.normalMap){
            const reader = new FileReader();
            reader.onload = (e) => {
                const textureLoader = new THREE.TextureLoader();
                const loadedTexture = textureLoader.load(e.target.result);
                setNormalMap(loadedTexture)
            }
            reader.readAsDataURL(object.material.normalMap)
        }
    },[object.material && object.material.normalMap])

    useEffect(() => {
        if (object.material && object.material.texture) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const textureLoader = new THREE.TextureLoader();
                const loadedTexture = textureLoader.load(e.target.result);
                setTexture(loadedTexture);
            };
            reader.readAsDataURL(object.material.texture);
        }
    }, [object.material && object.material.texture]);


    useFrame(() => {
        if (meshRef.current) {
          meshRef.current.position.set(...object.position);
          meshRef.current.rotation.set(...object.rotation);
          meshRef.current.scale.set(...object.scale);

           if (material && !object.mesh) {
                meshRef.current.material = material;
                 if (object.material && object.material.custom !== undefined && meshRef.current.material.userData) {
                        meshRef.current.material.userData.custom = object.material.custom;
                        meshRef.current.material.needsUpdate = true;
                    }
            } else if(material && object.mesh){
                 meshRef.current.traverse((child) => {
                    if (child.isMesh) {
                         child.material = material;
                         if (object.material && object.material.custom !== undefined && child.material.userData) {
                            child.material.userData.custom = object.material.custom;
                            child.material.needsUpdate = true;
                        }
                    }
                });
            }
            if(meshRef.current && !object.mesh){
                 meshRef.current.castShadow = object.material?.castShadow || false;
                 meshRef.current.receiveShadow = object.material?.receiveShadow || false;
            } else if (meshRef.current && object.mesh){
                meshRef.current.traverse((child) => {
                    if (child.isMesh) {
                         child.castShadow = object.material?.castShadow || false;
                         child.receiveShadow = object.material?.receiveShadow || false;
                    }
                });
            }
             if (object.material) {
                if (object.material.shininess !== undefined) {
                  meshRef.current.material.shininess = object.material.shininess;
                  meshRef.current.material.needsUpdate = true;
                }
            }
        }
    });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isSelected) {
        switch (event.key) {
          case 't':
            setMode('translate');
            break;
          case 'r':
            setMode('rotate');
            break;
          case 's':
            setMode('scale');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelected]);

    useEffect(() => {

        const handleTransformChange = () => {
            if (meshRef.current && transformRef.current && isDragging) {
                const { position, rotation, scale } = meshRef.current;
                onUpdateObject(object.id, {
                    position: position.toArray(),
                    rotation: rotation.toArray(),
                    scale: scale.toArray(),
                });
            }
        };

        const onDraggingChanged = (event) => {
            setIsDragging(event.value);

            if (!event.value) { // Dragging stopped
              const { position, rotation, scale } = meshRef.current;
              onUpdateObject(object.id, {
                position: position.toArray(),
                rotation: rotation.toArray(),
                scale: scale.toArray(),
              });
            }
        };

        if (isSelected && transformRef.current) {
            transformRef.current.attach(meshRef.current);
            transformRef.current.setMode(mode)
            transformRef.current.addEventListener('objectChange', handleTransformChange);
            transformRef.current.addEventListener('dragging-changed', onDraggingChanged);
        } else if (transformRef.current) {
            transformRef.current.detach();
             transformRef.current.removeEventListener('objectChange', handleTransformChange);
            transformRef.current.removeEventListener('dragging-changed', onDraggingChanged);
        }

        return () => { // Cleanup
            if (transformRef.current) {
                transformRef.current.removeEventListener('objectChange', handleTransformChange);
                transformRef.current.removeEventListener('dragging-changed', onDraggingChanged);
            }
        };
    }, [isSelected, object, onUpdateObject, mode, isDragging]);

    const handlePointerDown = (event) => {
        event.stopPropagation();
        // ONLY select if it's not already selected.  This prevents immediate deselection.
        if (!isSelected) {
            onSelect(object.id);
        }
    };




    return (
        <>
            {isSelected && (
                <TransformControls ref={transformRef} space="world" />
            )}
            {object.mesh ? (
                meshReady && meshRef.current && (
                <primitive
                    ref={meshRef}
                    object={meshRef.current}
                    onPointerDown={handlePointerDown}

                />)
            ) : (
                <mesh ref={meshRef} onPointerDown={handlePointerDown}>
                    {geometries[object.type] ? (
                        <primitive object={geometries[object.type]} attach="geometry" />
                    ) : null}
                </mesh>
            )}
            {/*Placeholder to prevent error if mesh isn't ready yet*/}
            {object.mesh && !meshReady && null}

        </>
    );
};

export default Model;