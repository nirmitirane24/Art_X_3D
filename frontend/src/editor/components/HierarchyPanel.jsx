import React, { useState } from "react";
import "../styles/hierarchyPanel.css";
import { FaBook, FaFileExport, FaFileImport, FaSpinner, FaTrash } from "react-icons/fa"; // Import FaSpinner for loading icon
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three'; // Import THREE for Vector3 and Box3

const HierarchyPanel = ({ sceneObjects, onObjectSelect, selectedObjects, onImportScene, onObjectDelete }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showImportPanel, setShowImportPanel] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredObjects = sceneObjects.filter((obj) =>
        obj.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generateDynamicIds = (objects) => {
        const shapeCount = {};
        return objects.map((obj) => {
            const { type } = obj;
            if (!shapeCount[type]) {
                shapeCount[type] = 1;
            } else {
                shapeCount[type] += 1;
            }
            return {
                ...obj,
                displayId: `${type} ${shapeCount[type]}`,
            };
        });
    };

    const objectsWithDynamicIds = generateDynamicIds(filteredObjects);

    const handleDelete = (obj) => {
        if (window.confirm(`Are you sure you want to delete ${obj.type}?`)) {
            onObjectDelete(obj.id); // Trigger delete in parent component
        }
    };

    const applyScalingAndImport = (loadedScene) => {
        const sceneGroup = loadedScene.scene || loadedScene;

        const boundingBox = new THREE.Box3().setFromObject(sceneGroup);
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        const scaleFactor = maxSize > 5 ? 5 / maxSize : 1; // Scale down if larger than 5 units

        sceneGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

        onImportScene(loadedScene);
        setIsLoading(false); // Stop loading
        setShowImportPanel(false); // Close import panel
    };

    const handleGLTFImport = (data, extension) => {
        setIsLoading(true); // Start loading
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
                setIsLoading(false); // Stop loading even on error
            }
        );
        dracoLoader.dispose();
    };

    const handleFBXImport = (data, extension) => {
        setIsLoading(true); // Start loading
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
                setIsLoading(false); // Stop loading even on error
            }
        );
    };

    const handleOBJImport = (data, extension) => {
        setIsLoading(true); // Start loading
        const loader = new OBJLoader();
        try {
            const object = loader.parse(data);
            console.log("Loaded OBJ Scene:", object);
            applyScalingAndImport({ scene: object }); // OBJLoader returns Object3D, wrap in object with scene prop for consistency
        } catch (error) {
            console.error("Error loading OBJ file:", error);
            setIsLoading(false); // Stop loading even on error
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
                setIsLoading(true); // Start loading when file is selected and reader starts
                if (extension === "gltf" || extension === "glb" || extension === "fbx") {
                    reader.readAsArrayBuffer(file);
                } else if (extension === "obj") {
                    reader.readAsText(file);
                } else {
                    console.error("Unsupported file format:", extension);
                    setIsLoading(false); // Stop loading if format is unsupported immediately
                }
            } else {
                setIsLoading(false); // Stop loading if no file selected
            }
        };
        input.click();
    };

    return (
        <div className="hierarchy-panel">
            <h3>Objects</h3>
            
            <div className="search-bar-container">
                <div className="search-input-container">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
            </div>

            <ul className="objects-list">
                {objectsWithDynamicIds.length === 0 ? (
                    <p className="no-objects">No models added</p>
                ) : (
                    objectsWithDynamicIds.map((obj, index) => (
                        <React.Fragment key={`${obj.type}-${obj.displayId}`}>
                            <li
                                className={selectedObjects.includes(obj.id) ? "selected" : ""}
                                onClick={() => onObjectSelect([obj.id])}
                            >
                                <span className="object-type">{obj.displayId}</span>
                                <div className="icon-buttons">
                                    <FaTrash
                                        style={{ marginLeft: '90px', marginTop: '4.5px', color: "rgba(255, 255, 255, 0.7)" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(obj);
                                        }}
                                    />
                                </div>
                            </li>
                            {index < objectsWithDynamicIds.length - 1 && <hr />}
                        </React.Fragment>
                    ))
                )}
            </ul>

            <div className="panel-buttons" style={{ marginLeft: "-10px" }}>
                <button onClick={() => setShowImportPanel(true)} disabled={isLoading}> {/* Disable button while loading */}
                    <FaFileImport /> Import
                </button>
                <button>
                    <FaBook /> Library
                </button>
                <button>
                    <FaFileExport /> Export
                </button>
            </div>

            {showImportPanel && (
                <div className="import-panel">
                    <h3>Import 3d Model</h3> {/* Consistent heading tag */}
                    {isLoading ? ( // Conditional rendering for loading state
                        <div className="loading-indicator">
                            <div className="loading-text">LOADING...</div>
                            <div className="loading-bar-container">
                                <div className="loading-bar-fill" style={{ width: '50%' }}></div>
                            </div>
                        </div>
                    ) : ( // Conditional rendering for import options when not loading
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

export default HierarchyPanel;