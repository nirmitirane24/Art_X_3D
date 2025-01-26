import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
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

    // Undo and redo stacks
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    const sceneRef = useRef();

    // Undo and Redo logic
    const saveToUndoStack = (newScene) => {
        setUndoStack((prevStack) => [...prevStack, newScene]);
        setRedoStack([]); // Clear redo stack on new action
    };

    const undo = () => {
        if (undoStack.length > 0) {
            const previousState = undoStack.pop();
            setRedoStack((prevStack) => [sceneObjects, ...prevStack]);
            setSceneObjects(previousState);
            setUndoStack([...undoStack]); // Update undo stack
        }
    };

    const redo = () => {
        if (redoStack.length > 0) {
            const nextState = redoStack.shift();
            setUndoStack((prevStack) => [...prevStack, sceneObjects]);
            setSceneObjects(nextState);
            setRedoStack([...redoStack]); // Update redo stack
        }
    };

    const addModel = (type) => {
        saveToUndoStack([...sceneObjects]); // Save current state before adding
        const newObject = {
            id: Date.now(),
            type,
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            material: 'standard',
            children: [],
        };
        setSceneObjects((prevObjects) => [...prevObjects, newObject]);
    };

    const updateObject = (objectId, newProps) => {
        saveToUndoStack([...sceneObjects]); // Save current state before updating
        setSceneObjects((prevObjects) =>
            prevObjects.map((obj) =>
                obj.id === objectId ? { ...obj, ...newProps } : obj
            )
        );
    };

    const deleteSelectedObjects = () => {
        saveToUndoStack([...sceneObjects]); // Save current state before deleting
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
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Delete' && selectedObjects.length > 0) {
                deleteSelectedObjects();
            } else if (event.ctrlKey && event.key === 'z') {
                undo();
            } else if (event.ctrlKey && event.key === 'y') {
                redo();
            } else if (
                event.key === 'ArrowUp' ||
                event.key === 'ArrowDown' ||
                event.key === 'ArrowLeft' ||
                event.key === 'ArrowRight'
            ) {
                handleArrowKeyMovement(event); // Move the object by 0.5 on each press
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedObjects, sceneObjects, undoStack, redoStack]);

    // Arrow key movement handler with undo/redo stack
    const handleArrowKeyMovement = (event) => {
        if (selectedObjects.length > 0) {
            const step = 0.5;
            const movement = { x: 0, y: 0, z: 0 };

            // Set movement direction based on the key pressed
            if (event.key === 'ArrowUp') movement.y = step; // Move up
            if (event.key === 'ArrowDown') movement.y = -step; // Move down
            if (event.key === 'ArrowLeft') movement.x = -step; // Move left
            if (event.key === 'ArrowRight') movement.x = step; // Move right

            // Save current scene state to undo stack before moving
            saveToUndoStack([...sceneObjects]);

            // Update object positions
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

    const handleObjectSelect = (objectIds) => {
        setSelectedObjects(objectIds);
        setCameraEnabled(objectIds.length === 0);
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
        const sceneGroup = loadedScene.scene || loadedScene;

        // Compute bounding box for the entire group
        const boundingBox = new THREE.Box3().setFromObject(sceneGroup);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());


        const importedObject = {
            id: Date.now() + Math.random(), // Generate unique IDs
            type: sceneGroup.name || "ImportedModel",
            mesh: sceneGroup, // Store the entire scene group
            position: [0,0,0], // Reset position to origin, can adjust if needed
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
        // console.log("Updated sceneObjects after import:", sceneObjects); // Log after setting state
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
                    />

                    <PropertiesPanel
                        selectedObjects={selectedObjects}
                        sceneObjects={sceneObjects}
                        updateObject={updateObject}
                    />
                </div>
                <div className="viewport">
                    <Canvas
                        camera={{ position: [0, 5, 10], fov: 45 }}
                        onCreated={({ gl }) => {
                            gl.setClearColor('#2D2E32');
                        }}
                    >
                        <ambientLight intensity={0} />
                        <pointLight position={[0, 0, 0]} intensity={50} />
                        <gridHelper args={[10, 10]} />
                        <GroundPlane />
                        <group ref={sceneRef}>
                            {sceneObjects.map((object, index) => { // Keep index for logging
                                // console.log(`EditorManager - sceneObjects[${index}]:`, object);
                                return (
                                    <Model
                                        key={object.id}
                                        object={object}
                                        isSelected={selectedObjects.includes(object.id)}
                                        setCameraEnabled={setCameraEnabled}
                                        onSelect={handleObjectSelect}
                                        onUpdateObject={updateObject}
                                    />
                                );
                            })}
                        </group>
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

export default EditorManager;