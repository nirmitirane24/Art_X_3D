import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Toolbar from './components/Toolbar';
import HierarchyPanel from './components/HierarchyPanel.jsx';
import PropertiesPanel from './components/PropertiesPanel';
import CameraControls from './components/CameraControls';
import GroundPlane from './components/GroundPlane';
import Model from './components/Model';
import './styles/editorManager.css';

const EditorManager = () => {
    const [sceneObjects, setSceneObjects] = useState([]);
    const [selectedObjects, setSelectedObjects] = useState([]);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const sceneRef = useRef(); 

    const deleteSelectedObjects = () => {
        setSceneObjects((prevObjects) =>
            prevObjects.filter((obj) => {
                if (selectedObjects.includes(obj.id)) {
                    // Dispose geometry and material when deleting
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
            } 
        };
    
        window.addEventListener('keydown', handleKeyDown);
    
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedObjects, deleteSelectedObjects]); // Include deleteSelectedObjects in the dependency array


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'q') {
                setSelectedObjects([]);
                setCameraEnabled(true);
            }
        };
    
        window.addEventListener('keydown', handleKeyDown);
    
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []); 

    const addModel = (type) => {
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

    const handleObjectSelect = (objectIds) => {
        setSelectedObjects(objectIds);
        setCameraEnabled(objectIds.length === 0);
    };

    const updateObject = (objectId, newProps) => {
        setSceneObjects((prevObjects) =>
            prevObjects.map((obj) =>
                obj.id === objectId ? { ...obj, ...newProps } : obj
            )
        );
    };

    const deselectAllObjects = (event) => {
        if (event.type === 'click' && ( event.target.closest('.edit-mode-button') || event.target.closest('.hierarchy-panel'))) {
            setSelectedObjects([]);
            setCameraEnabled(true);
        }
    };
    

    return (
        <div className="editor-container" onClick={deselectAllObjects}>
            <Toolbar onAddModel={addModel} selectedObjects={selectedObjects} />
            <div className="main-area">
                <div className="sidebar">
                    <HierarchyPanel
                        sceneObjects={sceneObjects}
                        onObjectSelect={handleObjectSelect}
                        selectedObjects={selectedObjects}
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
                        <pointLight position={[0, 0, 0]} intensity={50}/>
                        <gridHelper args={[10, 10]} />
                        <GroundPlane />
                        <group ref={sceneRef}>
                            {sceneObjects.map((object) => (
                                <Model
                                    key={object.id}
                                    object={object}
                                    isSelected={selectedObjects.includes(object.id)}
                                    setCameraEnabled={setCameraEnabled}
                                    onSelect={handleObjectSelect}
                                    onUpdateObject={updateObject} // Pass the callback
                                />
                            ))}
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