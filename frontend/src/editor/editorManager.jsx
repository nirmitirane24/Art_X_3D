// (Full code from previous responses, with minor updates for clarity)
import React, { useState, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import Toolbar from "./components/Toolbar";
import HierarchyPanel from "./components/HierarchyPanel.jsx";
import PropertiesPanel from "./components/PropertiesPanel";
import CameraControls from "./components/CameraControls";
import GroundPlane from "./components/GroundPlane";
import Model from "./components/Model";
import AIChat from "./components/AIChat";
import PropertiesCopyPaste from "./components/PropertiesCopyPaste";
import "./styles/editorManager.css";
import * as THREE from "three";
import UndoRedo from "./components/EditorManagerComponents/undoredo.jsx";
import KeyboardShortcuts from "./components/EditorManagerComponents/keyshortcuts.jsx";
import CopyPaste from "./components/EditorManagerComponents/copypaste.jsx";
import LightHelperComponent from "./components/LightHelperComponent.jsx"; // Import the helper


const EditorManager = () => {
    const [sceneObjects, setSceneObjects] = useState([]);
    const [selectedObjects, setSelectedObjects] = useState([]);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [sceneSettings, setSceneSettings] = useState({
        backgroundColor: "#2D2E32",
        effectsEnabled: false,
        fogEnabled: false,
        fogColor: "#ffffff",
        fogNear: 1,
        fogFar: 100,
        ambientShadowsEnabled: false,
        ambientIntensity: 0,
        lightColor: "#ffffff",
        lightIntensity: 5,
        lightX: 0,
        lightY: 0,
        lightZ: 0,
        lightShadows: false,
        shadowMapSize: 1024,
        shadowCameraNear: 0.1,
        shadowCameraFar: 50,
        shadowCameraLeft: -10,
        shadowCameraRight: 10,
        shadowCameraTop: 10,
        shadowCameraBottom: -10,
    });
    const sceneRef = useRef(new THREE.Scene());
    const dirLightRef = useRef(); // Ref for the directional light

    const { undo, redo, saveToUndoStack, undoStack, redoStack } = UndoRedo({
        sceneObjects,
        setSceneObjects,
        sceneSettings,
        setSceneSettings,
        selectedObjects,
        setSelectedObjects,
    });

    const { copySelectedObjects, pasteCopiedObjects, undoPaste, redoPaste } =
        CopyPaste({
            sceneObjects,
            selectedObjects,
            setSceneObjects,
            saveToUndoStack,
        });

    const deleteSelectedObjects = () => {
        if (selectedObjects.length > 0) {
            saveToUndoStack([...sceneObjects], { ...sceneSettings });

            setSceneObjects((prevObjects) =>
                prevObjects.filter((obj) => {
                    if (selectedObjects.includes(obj.id)) {
                        const object3D = sceneRef.current.getObjectById(obj.id);
                        if (object3D) {
                            object3D.traverse((child) => {
                                if (child.isMesh) {
                                    if (child.geometry) child.geometry.dispose();
                                    if (child.material) child.material.dispose();
                                }
                            });
                            sceneRef.current.remove(object3D);
                        }
                        return false;
                    }
                    return true;
                })
            );

            setSelectedObjects([]);
        }
    };

    const handleDeleteObject = (objectId) => {
        saveToUndoStack([...sceneObjects], { ...sceneSettings });
        setSceneObjects((prevObjects) =>
            prevObjects.filter((obj) => obj.id !== objectId)
        );
        setSelectedObjects((prevSelected) =>
            prevSelected.filter((id) => id !== objectId)
        );
    };

    const handleArrowKeyMovement = (event) => {
        if (selectedObjects.length > 0) {
            const step = 0.5;
            const movement = { x: 0, y: 0, z: 0 };
            if (event.key === "ArrowUp") movement.y = step;
            if (event.key === "ArrowDown") movement.y = -step;
            if (event.key === "ArrowLeft") movement.x = -step;
            if (event.key === "ArrowRight") movement.x = step;
            saveToUndoStack([...sceneObjects], { ...sceneSettings });
            setSceneObjects((prevObjects) => {
                const updatedObjects = prevObjects.map((obj) => {
                    if (selectedObjects.includes(obj.id)) {
                        return {
                            ...obj,
                            position: [
                                obj.position[0] + movement.x,
                                obj.position[1] + movement.y,
                                obj.position[2] + movement.z,
                            ],
                        };
                    }
                    return obj;
                });
                return updatedObjects;
            });
        }
    };

    const addModel = (type) => {
        saveToUndoStack([...sceneObjects], { ...sceneSettings });
        const newObject = {
            id: Date.now(),
            type,
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            material: {
                color: "#ffffff",
                metalness: 0,
                roughness: 0.5,
                castShadow: false,
                receiveShadow: false,
            },
            children: [],
        };
        setSceneObjects((prevObjects) => [...prevObjects, newObject]);
    };

    // --- ADD LIGHT FUNCTION ---
    const addLight = (type) => {
        saveToUndoStack([...sceneObjects], { ...sceneSettings });
        const lightId = Date.now(); // Consistent ID generation
        const lightProps = {
            id: lightId, // Use the generated ID
            type,
            displayId: `${type} ${lightId}`, // Display ID for user-friendly name
            position: [1, 3, 2], // Default position
            color: "#ffffff",
            intensity: 1,
        };

        // Add light-specific properties
        if (type === "spotLight") {
            lightProps.angle = Math.PI / 6; // 30 degrees
            lightProps.penumbra = 0.1;
            lightProps.distance = 0;  //  Defaults in Three.js
            lightProps.decay = 2;
            lightProps.target = [0, 0, 0]; // Target position as array
        } else if (type === 'directionalLight'){
            lightProps.target = [0,0,0]
        }

        setSceneObjects((prevObjects) => [...prevObjects, lightProps]);
    };


   const handleObjectSelect = (objectIds) => {
        if (!objectIds || objectIds.length === 0) return;
        saveToUndoStack();
        setSelectedObjects(objectIds);  // No need to map to strings
        setCameraEnabled(false); // Ensure camera control is disabled when selecting an object

    };


    const updateObject = (objectId, newProps) => {
        if (objectId === "scene") {
            saveToUndoStack([...sceneObjects], { ...sceneSettings });
            setSceneSettings((prevSettings) => ({
                ...prevSettings,
                ...newProps,
            }));
        } else {
            saveToUndoStack([...sceneObjects], { ...sceneSettings });
            setSceneObjects((prevObjects) =>
                prevObjects.map((obj) =>
                    obj.id === objectId ? { ...obj, ...newProps } : obj
                )
            );
        }
    };

    const deselectAllObjects = (event) => {
        if (
            event.type === "click" &&
            (event.target.closest(".edit-mode-button") ||
                event.target.closest(".hierarchy-panel"))
        ) {
            setSelectedObjects([]);
            setCameraEnabled(true);
        }
    };

    const onImportScene = (loadedScene) => {
        saveToUndoStack([...sceneObjects], { ...sceneSettings });

        const sceneGroup = loadedScene.scene || loadedScene;
        const childMeshes = [];

        sceneGroup.traverse((child) => {
            if (child.isMesh) {
                // Extract shape name properly
                let shapeName = child.name && !child.name.startsWith("mesh_") ? child.name : null;

                // Check geometry type and parameters for common shapes
                if (!shapeName && child.geometry.parameters) {
                    if (child.geometry.parameters.width !== undefined) shapeName = "Box";
                    else if (child.geometry.parameters.radius !== undefined) shapeName = "Sphere";
                    else if (child.geometry.parameters.radiusTop !== undefined) shapeName = "Cylinder";
                    else if (child.geometry.parameters.innerRadius !== undefined) shapeName = "Torus";
                }

                // If no valid name, default to "UnknownShape"
                if (!shapeName) shapeName = "UnknownShape";

                const childBoundingBox = new THREE.Box3().setFromObject(child);
                const childCenter = childBoundingBox.getCenter(new THREE.Vector3());
                const childSize = childBoundingBox.getSize(new THREE.Vector3());

                // Extract Material and Texture Information
                const material = child.material;
                let materialData = {
                    name: material?.name || "standard",
                    color: material?.color?.getHexString() || "ffffff",
                    texture: material?.map?.image ? material.map.image.src : null,
                };

                const childObject = {
                    id: Date.now() + Math.random(),
                    type: shapeName, // Now displays proper shape name
                    mesh: child,
                    position: [child.position.x, child.position.y, child.position.z],
                    rotation: [child.rotation.x, child.rotation.y, child.rotation.z],
                    scale: [child.scale.x, child.scale.y, child.scale.z],
                    material: materialData,
                    boundingBox: {
                        min: [childBoundingBox.min.x, childBoundingBox.min.y, childBoundingBox.min.z],
                        max: [childBoundingBox.max.x, childBoundingBox.max.y, childBoundingBox.max.z],
                        center: [childCenter.x, childCenter.y, childCenter.z],
                        size: [childSize.x, childSize.y, childSize.z],
                    },
                };

                childMeshes.push(childObject);
            }
        });

        setSceneObjects((prevObjects) => [...prevObjects, ...childMeshes]);
    };

    return (
        <div className="editor-container" onClick={deselectAllObjects}>
            <Toolbar
                onAddModel={addModel}
                onAddLight={addLight} // Pass addLight to Toolbar
                onUndo={undo}
                onRedo={redo}
                undoDisabled={undoStack.length === 0}
                redoDisabled={redoStack.length === 0}
                selectedObjects={selectedObjects}
            />
            <div className="main-area">
                <div className="sidebar">
                    <HierarchyPanel
                        sceneObjects={sceneObjects}
                        onObjectSelect={handleObjectSelect}
                        selectedObjects={selectedObjects}
                        onImportScene={onImportScene}
                        onObjectDelete={handleDeleteObject}
                        scene={sceneRef.current}
                    />
                    <PropertiesPanel
                        selectedObjects={selectedObjects ?? []}
                        sceneObjects={sceneObjects ?? []}
                        updateObject={updateObject}
                        sceneSettings={sceneSettings}
                    />
                </div>
                <div className="viewport">
                    <Canvas
                        shadows
                        camera={{ position: [0, 5, 10], fov: 45 }}
                        style={{ backgroundColor: sceneSettings.backgroundColor }}
                    >
                        <SceneContent
                            sceneSettings={sceneSettings}
                            sceneRef={sceneRef}
                            sceneObjects={sceneObjects}
                            selectedObjects={selectedObjects}
                            setCameraEnabled={setCameraEnabled}
                            updateObject={updateObject}
                            handleObjectSelect={handleObjectSelect}
                            dirLightRef={dirLightRef}
                        />
                        <CameraControls
                            enabled={cameraEnabled}
                            selectedObjects={selectedObjects}
                        />
                    </Canvas>
                </div>
            </div>
            <KeyboardShortcuts
                selectedObjects={selectedObjects}
                deleteSelectedObjects={deleteSelectedObjects}
                undo={() => {
                    undo();
                    undoPaste();
                }}
                redo={() => {
                    redo();
                    redoPaste();
                }}
                copySelectedObjects={copySelectedObjects}
                pasteCopiedObjects={pasteCopiedObjects}
                handleArrowKeyMovement={handleArrowKeyMovement}
            />

            <AIChat />
            <PropertiesCopyPaste
                sceneObjects={sceneObjects}
                selectedObjects={selectedObjects}
                setSceneObjects={setSceneObjects}
                saveToUndoStack={saveToUndoStack}
            />
        </div>
    );
};

function SceneContent({
    sceneSettings,
    sceneRef,
    sceneObjects,
    selectedObjects,
    setCameraEnabled,
    updateObject,
    handleObjectSelect,
    dirLightRef,
}) {
    const { gl } = useThree();

    useEffect(() => {
        if (gl && sceneSettings.backgroundColor) {
            gl.setClearColor(sceneSettings.backgroundColor);
        }
        if (dirLightRef.current) {
            dirLightRef.current.shadow.mapSize.width = sceneSettings.shadowMapSize;
            dirLightRef.current.shadow.mapSize.height = sceneSettings.shadowMapSize;
            dirLightRef.current.shadow.camera.near = sceneSettings.shadowCameraNear;
            dirLightRef.current.shadow.camera.far = sceneSettings.shadowCameraFar;
            dirLightRef.current.shadow.camera.left = sceneSettings.shadowCameraLeft;
            dirLightRef.current.shadow.camera.right = sceneSettings.shadowCameraRight;
            dirLightRef.current.shadow.camera.top = sceneSettings.shadowCameraTop;
            dirLightRef.current.shadow.camera.bottom =
                sceneSettings.shadowCameraBottom;
            dirLightRef.current.shadow.camera.updateProjectionMatrix();
        }
    }, [
        sceneSettings.backgroundColor,
        gl,
        sceneSettings.shadowMapSize,
        sceneSettings.shadowCameraNear,
        sceneSettings.shadowCameraFar,
        sceneSettings.shadowCameraLeft,
        sceneSettings.shadowCameraRight,
        sceneSettings.shadowCameraTop,
        sceneSettings.shadowCameraBottom,
        dirLightRef,
    ]);

    return (
        <>
            <ambientLight
                intensity={
                    sceneSettings.ambientShadowsEnabled
                        ? sceneSettings.ambientIntensity
                        : 0
                }
            />
            {sceneSettings.lightShadows ? (
                <pointLight
                    ref={dirLightRef}
                    position={[
                        sceneSettings.lightX,
                        sceneSettings.lightY,
                        sceneSettings.lightZ,
                    ]}
                    intensity={sceneSettings.lightIntensity}
                    color={sceneSettings.lightColor}
                    castShadow
                />
            ) : null}
            {/* Removed CameraHelper */}
            {sceneSettings.fogEnabled && (
                <fog
                    attach="fog"
                    args={[
                        sceneSettings.fogColor,
                        sceneSettings.fogNear,
                        sceneSettings.fogFar,
                    ]}
                />
            )}
            <gridHelper args={[10, 10]} />
            <GroundPlane />
            <group ref={sceneRef}>
                {sceneObjects.map((object) => {
                    if (object.type === 'pointLight' || object.type === 'spotLight' || object.type === 'directionalLight') {
                        // Render lights using <primitive>
                        let lightInstance;
                        if (object.type === 'pointLight') {
                            lightInstance = new THREE.PointLight(object.color, object.intensity);
                        } else if (object.type === 'spotLight') {
                            lightInstance = new THREE.SpotLight(object.color, object.intensity, object.distance, object.angle, object.penumbra, object.decay);
                             const targetObject = new THREE.Object3D();
                            targetObject.position.fromArray(object.target);
                            targetObject.name = `target-${object.id}` //give the name so we can easily refer the object
                            sceneRef.current.add(targetObject)
                            lightInstance.target = targetObject;


                        } else if (object.type === 'directionalLight') {
                             lightInstance = new THREE.DirectionalLight(object.color, object.intensity);
                              const targetObject = new THREE.Object3D();
                            targetObject.position.fromArray(object.target);
                            targetObject.name = `target-${object.id}` //give the name so we can easily refer the object
                            sceneRef.current.add(targetObject)
                            lightInstance.target = targetObject;
                        }

                        lightInstance.position.fromArray(object.position);
                        //we don't need to set rotation for lights individually, so removing it
                        lightInstance.name = object.displayId;  // Set the name for easy access


                        return (
                            <React.Fragment key={object.id}>
                                <primitive object={lightInstance} />
                                {/* Conditionally render the helper */}
                                {selectedObjects.includes(object.id) && ( //use obj.id in includes function
                                    <LightHelperComponent lightType={object.type} lightObject={object} scene={sceneRef.current} />
                                )}
                            </React.Fragment>
                        );
                    } else {
                        // Render meshes
                        return (
                            <Model
                                key={object.id}
                                object={object}
                                isSelected={selectedObjects.includes(object.id)}
                                setCameraEnabled={setCameraEnabled}
                                onSelect={() => handleObjectSelect([object.id])} // Pass an array containing the object ID
                                onUpdateObject={updateObject}
                            />
                        );
                    }
                })}
            </group>
        </>
    );
}

export default EditorManager;