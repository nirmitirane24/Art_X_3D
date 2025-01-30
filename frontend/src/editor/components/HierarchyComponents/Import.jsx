import React, { useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';

const Import = ({ onImportScene }) => {
    const [showImportPanel, setShowImportPanel] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Manage isLoading state internally

    const applyScalingAndImport = (loadedScene) => {
        const sceneGroup = loadedScene.scene || loadedScene;
        const boundingBox = new THREE.Box3().setFromObject(sceneGroup);
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        const scaleFactor = maxSize > 5 ? 5 / maxSize : 1;

        sceneGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

        onImportScene(loadedScene);
        setIsLoading(false);
        setShowImportPanel(false);
    };

    const handleGLTFImport = (data, extension) => {
        setIsLoading(true);
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        loader.setDRACOLoader(dracoLoader);

        loader.parse(
            data,
            "",
            (loadedScene) => {
                console.log("Loaded GLTF Scene:", loadedScene);
                applyScalingAndImport(loadedScene);
            },
            (error) => {
                console.error("Error loading GLTF file:", error);
                setIsLoading(false);
            }
        );
        dracoLoader.dispose();
    };

    const handleFBXImport = (data, extension) => {
        setIsLoading(true);
        const loader = new FBXLoader();
        loader.parse(
            data,
            "",
            (loadedScene) => {
                console.log("Loaded FBX Scene:", loadedScene);
                applyScalingAndImport(loadedScene);
            },
            (error) => {
                console.error("Error loading FBX file:", error);
                setIsLoading(false);
            }
        );
    };

    const handleOBJImport = (data, extension) => {
        setIsLoading(true);
        const loader = new OBJLoader();
        try {
            const object = loader.parse(data);
            console.log("Loaded OBJ Scene:", object);
            applyScalingAndImport({ scene: object });
        } catch (error) {
            console.error("Error loading OBJ file:", error);
            setIsLoading(false);
        }
    };

    const handleFileSelection = (acceptedFormats) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = acceptedFormats;
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const extension = file.name.split(".").pop().toLowerCase();
                const reader = new FileReader();

                reader.onload = (event) => {
                    const data = event.target.result;

                    if (extension === "gltf" || extension === "glb") {
                        handleGLTFImport(data, extension);
                    } else if (extension === "obj") {
                        handleOBJImport(data, extension);
                    } else if (extension === "fbx") {
                        handleFBXImport(data, extension);
                    } else {
                        console.error("Unsupported file format:", extension);
                    }
                };
                setIsLoading(true);
                if (extension === "gltf" || extension === "glb" || extension === "fbx") {
                    reader.readAsArrayBuffer(file);
                } else if (extension === "obj") {
                    reader.readAsText(file);
                } else {
                    console.error("Unsupported file format:", extension);
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };
        input.click();
    };

    return (
        <div>
            <button onClick={() => setShowImportPanel(true)} disabled={isLoading}>
                Import
            </button>
            {showImportPanel && (
                <div className="import-panel">
                    <h3>Import 3D Model</h3>
                    {isLoading ? (
                        <div className="loading-indicator">
                            <div className="loading-text">LOADING...</div>
                            <div className="loading-bar-container">
                                <div className="loading-bar-fill" style={{ width: '50%' }}></div>
                            </div>
                        </div>
                    ) : (
                        <div className="import-options">
                            <button
                                className="modal-buttons"
                                onClick={() => handleFileSelection(".gltf,.glb,.obj,.fbx")}
                                disabled={isLoading}
                            >
                                3D Model (GLTF, OBJ, FBX)
                            </button>
                        </div>
                    )}
                    <button className="modal-buttons" onClick={() => setShowImportPanel(false)} disabled={isLoading}>
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default Import;