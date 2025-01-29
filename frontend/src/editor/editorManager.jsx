import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import Toolbar from './components/Toolbar';
import HierarchyPanel from './components/HierarchyPanel.jsx';
import PropertiesPanel from './components/PropertiesPanel';
import CameraControls from './components/CameraControls';
import GroundPlane from './components/GroundPlane';
import Model from './components/Model';
import './styles/editorManager.css';
import * as THREE from "three";

const EditorManager = () => {
    const [sceneObjects, setSceneObjects] = useState([]);
    const [selectedObjects, setSelectedObjects] = useState([]);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [isMoving, setIsMoving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [sceneSettings, setSceneSettings] = useState({
        backgroundColor: '#2D2E32',
        effectsEnabled: false,
        fogEnabled: false,
        fogColor: '#ffffff',
        fogNear: 1,
        fogFar: 100,
        ambientShadowsEnabled: false,
        ambientIntensity: 0,
        lightColor: '#ffffff',
        lightIntensity: 50,
        lightX: 0,
        lightY: 0,
        lightZ: 0,
        lightShadows: false,
    });
    const sceneRef = useRef(new THREE.Scene());


    // Undo and redo stacks
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [copiedObjects, setCopiedObjects] = useState([]);

    const saveToUndoStack = (newSceneObjects, newSceneSettings) => {
        setUndoStack(prevStack => [
            ...prevStack,
            { sceneObjects: newSceneObjects, sceneSettings: newSceneSettings }
        ]);
        setRedoStack([]); // Clear redo stack on new action
    };

    const undo = () => {
        try {
            if (undoStack?.length > 0) {
                const previousState = undoStack[undoStack.length - 1];
    
                setRedoStack((prevStack) => [
                    ...prevStack,
                    { sceneObjects, sceneSettings },
                ]);
    
                setSceneObjects(previousState.sceneObjects ?? []);
                setSceneSettings(previousState.sceneSettings ?? {});
    
                // Ensure selectedObjects does not contain IDs that no longer exist
                setSelectedObjects((prevSelected) =>
                    previousState.sceneObjects?.length > 0
                        ? prevSelected.filter(id => previousState.sceneObjects.some(obj => obj.id === id))
                        : []
                );
    
                setUndoStack((prevStack) => prevStack.slice(0, -1));
            }
        } catch (error) {
            console.error("Undo error:", error);
        }
    };
    
    
    
    const redo = () => {
        if (redoStack?.length > 0) {  // ✅ Prevent undefined errors
            const nextState = redoStack[redoStack.length - 1];
    
            setUndoStack((prevStack) => [
                ...prevStack,
                { sceneObjects, sceneSettings },
            ]);
    
            setSceneObjects(nextState.sceneObjects ?? []);
            setSceneSettings(nextState.sceneSettings ?? {});
    
            setRedoStack((prevStack) => prevStack.slice(0, -1));
        }
    };
    

    const deleteSelectedObjects = () => {
        if (selectedObjects.length > 0) {
            // Save the current state to the undo stack
            saveToUndoStack([...sceneObjects], { ...sceneSettings });

            setSceneObjects((prevObjects) =>
                prevObjects.filter((obj) => {
                    // Remove selected objects from the scene
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

            // Clear selected objects
            setSelectedObjects([]);
        }
    };

    // Delete object from the scene
    const handleDeleteObject = (objectId) => {
        // Save the current state to the undo stack
        saveToUndoStack([...sceneObjects], { ...sceneSettings });

        // Update the scene objects by removing the specified object
        setSceneObjects((prevObjects) => prevObjects.filter((obj) => obj.id !== objectId));
        setSelectedObjects((prevSelected) => prevSelected.filter((id) => id !== objectId));
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Delete' && selectedObjects.length > 0) {
                deleteSelectedObjects();
            } else if (event.ctrlKey && event.key === 'z') {
                undo();
            } else if (event.ctrlKey && event.key === 'y') {
                redo();
            } else if (event.ctrlKey && event.key === 'c') {
                copySelectedObjects();
            } else if (event.ctrlKey && event.key === 'v') {
                pasteCopiedObjects();
            } else if (
                event.key === 'ArrowUp' ||
                event.key === 'ArrowDown' ||
                event.key === 'ArrowLeft' ||
                event.key === 'ArrowRight'
            ) {
                handleArrowKeyMovement(event);
            }
        };

        const handleWheel = (event) => {
            // Prevent the default zoom behavior
            if (event.ctrlKey) {
                event.preventDefault();
            }
        };

        const handleContextMenu = (event) => {
            // Prevent the default right-click context menu
            event.preventDefault();
        };

        const handleMouseDown = () => {
            setIsDragging(true);
            document.body.classList.add('no-select'); // Disable text selection
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.classList.remove('no-select'); // Re-enable text selection
        };

        console.log("Undo Stack:", undoStack);
        console.log("Redo Stack:", redoStack);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('contextmenu', handleContextMenu);
            window.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mouseup', handleMouseUp);
        };
    }, [selectedObjects, sceneObjects, undoStack, redoStack, copiedObjects]);


    const copySelectedObjects = () => {
        const copied = sceneObjects.filter((obj) => selectedObjects.includes(obj.id));
        setCopiedObjects(copied);
    };

    const pasteCopiedObjects = () => {
        if (copiedObjects.length > 0) {
            const newObjects = copiedObjects.map((obj) => {
                const newObject = { ...obj, id: Date.now(), position: [...obj.position] };
                // Offset pasted objects to avoid overlap
                newObject.position[0] += 1;
                newObject.position[1] += 1;
                newObject.position[2] += 1;
                return newObject;
            });

            setSceneObjects((prevObjects) => [...prevObjects, ...newObjects]);
        }
    };

    const handleArrowKeyMovement = (event) => {
        if (selectedObjects.length > 0) {
            const step = 0.5;
            const movement = { x: 0, y: 0, z: 0 };
            if (event.key === 'ArrowUp') movement.y = step;
            if (event.key === 'ArrowDown') movement.y = -step;
            if (event.key === 'ArrowLeft') movement.x = -step;
            if (event.key === 'ArrowRight') movement.x = step;
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
                color: '#ffffff',
                metalness: 0,
                roughness: 0.5,
            },
            children: [],
        };
        setSceneObjects((prevObjects) => [...prevObjects, newObject]);
    };

    const handleObjectSelect = (objectIds) => {
        saveToUndoStack();
        setSelectedObjects(objectIds);
        setCameraEnabled(objectIds.length === 0);
    };

    const updateObject = (objectId, newProps) => {
        if (objectId === 'scene') {
            saveToUndoStack([...sceneObjects], { ...sceneSettings });
            setSceneSettings(prevSettings => ({
                ...prevSettings,
                ...newProps
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
            event.type === 'click' &&
            (event.target.closest('.edit-mode-button') ||
                event.target.closest('.hierarchy-panel'))
        ) {
            setSelectedObjects([]);
            setCameraEnabled(true);
        }
    };

    const onImportScene = (loadedScene) => {
        saveToUndoStack([...sceneObjects], { ...sceneSettings });
        const sceneGroup = loadedScene.scene || loadedScene;
        const boundingBox = new THREE.Box3().setFromObject(sceneGroup);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());
        const importedObject = {
            id: Date.now() + Math.random(),
            type: sceneGroup.name || "ImportedModel",
            mesh: sceneGroup, // Store the entire scene group
            position: [0, 0, 0], // Reset position to origin, can adjust if needed
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            material: 'standard', // Default material, can be updated in properties panel
            boundingBox: {
                min: [boundingBox.min.x, boundingBox.min.y, boundingBox.min.z],
                max: [boundingBox.max.x, boundingBox.max.y, boundingBox.max.z],
                center: [center.x, center.y, center.z],
                size: [size.x, size.y, size.z],
            },
            children: [],
        };
        setSceneObjects((prevObjects) => [...prevObjects, importedObject]);
    };

    return (
        <div className="editor-container" onClick={deselectAllObjects}>
            <Toolbar
                onAddModel={addModel}
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
                        camera={{ position: [0, 5, 10], fov: 45 }}

                        style={{ backgroundColor: sceneSettings?.backgroundColor || "#000000" }}
                    >
                        <SceneContent
                            sceneSettings={sceneSettings}
                            sceneRef={sceneRef}
                            sceneObjects={sceneObjects}
                            selectedObjects={selectedObjects}
                            setCameraEnabled={setCameraEnabled}
                            updateObject={updateObject}
                            handleObjectSelect={handleObjectSelect}
                        />
                        <CameraControls
                            enabled={cameraEnabled}
                            selectedObjects={selectedObjects}
                        />
                    </Canvas>
                </div>
            </div>
        </div>
    );
};

function SceneContent({ sceneSettings, sceneRef, sceneObjects, selectedObjects, setCameraEnabled, updateObject, handleObjectSelect }) {
    const { gl } = useThree();
    useEffect(() => {
        if (gl) {
            gl.setClearColor(sceneSettings.backgroundColor);
        }

    }, [sceneSettings.backgroundColor, gl])

    return (
        <>
            <ambientLight intensity={sceneSettings.ambientShadowsEnabled ? sceneSettings.ambientIntensity : 0} />
            {sceneSettings.lightShadows ? (
                <pointLight
                    position={[sceneSettings.lightX, sceneSettings.lightY, sceneSettings.lightZ]}
                    intensity={sceneSettings.lightIntensity}
                    color={sceneSettings.lightColor}
                    castShadow={true}
                />
            ) : null}
            {sceneSettings.fogEnabled && <fog attach="fog" args={[sceneSettings.fogColor, sceneSettings.fogNear, sceneSettings.fogFar]} />}
            <gridHelper args={[10, 10]} />
            <GroundPlane receiveShadow={true} />
            <group ref={sceneRef}>
                {sceneObjects.map((object) => (
                    <Model
                        key={object.id}
                        object={object}
                        isSelected={selectedObjects.includes(object.id)}
                        setCameraEnabled={setCameraEnabled}
                        onSelect={handleObjectSelect}
                        onUpdateObject={updateObject}
                    />
                ))}
            </group>

        </>
    )
}

export default EditorManager;