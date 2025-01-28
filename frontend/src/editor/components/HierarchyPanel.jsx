import React, { useState } from "react";
import "../styles/hierarchyPanel.css";
import { FaBook, FaFileExport, FaFileImport, FaSpinner, FaTrash, FaTimes } from "react-icons/fa"; // Import FaSpinner for loading icon
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import * as THREE from 'three'; // Import THREE for Vector3 and Box3

const HierarchyPanel = ({ sceneObjects, onObjectSelect, selectedObjects, onImportScene, onObjectDelete, scene }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showImportPanel, setShowImportPanel] = useState(false);
    const [showLibraryPanel, setShowLibraryPanel] = useState(false);
    const [showExportPanel, setShowExportPanel] = useState(false);
    
    const [isExporting, setIsExporting] = useState(false);
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

    const handleExport = (format) => {
        setIsExporting(true);
    
        // Filter objects: exclude GroundPlane and ensure Object3D instances
        const objectsToExport = scene.children.filter(obj => obj.name !== "GroundPlane" && obj instanceof THREE.Object3D);
    
        if (objectsToExport.length === 0) {
            console.error("No valid objects to export.");
            setIsExporting(false);
            return;
        }
    
        if (format === "gltf") {
            exportGLTF(objectsToExport);
        } else if (format === "obj") {
            exportOBJ(objectsToExport);
        } else if (format === "fbx") {
            exportFBX(objectsToExport);
        }
    
        setIsExporting(false);
        setShowExportPanel(false);
    };
    
    const exportGLTF = (objects) => {
        const exporter = new GLTFExporter();
    
        // Group all objects to export as a single scene
        const group = new THREE.Group();
        objects.forEach(obj => group.add(obj.clone())); // Clone to ensure modifications do not affect original objects
    
        exporter.parse(
            group,
            (result) => {
                // If exporting as GLB
                const isBinary = false; // Change to true for .glb
    
                const output = isBinary ? result : JSON.stringify(result, null, 2);
                const blob = new Blob([output], { type: isBinary ? 'application/octet-stream' : 'application/json' });
                const filename = isBinary ? 'scene.glb' : 'scene.gltf';
                downloadBlob(blob, filename);
            },
            (error) => {
                console.error("Error exporting GLTF:", error);
            },
            { binary: false } // Change to true for GLB
        );
    };
    
    const exportOBJ = (objects) => {
        const exporter = new OBJExporter();
    
        // Group all objects to export as a single scene
        const group = new THREE.Group();
        objects.forEach(obj => group.add(obj.clone()));
    
        try {
            const objString = exporter.parse(group);
            const blob = new Blob([objString], { type: "text/plain" });
            downloadBlob(blob, "scene.obj");
            console.log("OBJ export successful!");
        } catch (error) {
            console.error("Error exporting OBJ:", error);
        }
    };
    
    const exportFBX = (objects) => {
        const exporter = new FBXExporter();
        const fbxData = exporter.parse(objects);
        const blob = new Blob([fbxData], { type: "application/octet-stream" });
        downloadBlob(blob, "scene.fbx");
    };

    const downloadBlob = (blob, filename) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                <button onClick={() => setShowLibraryPanel(true)}>
                    <FaBook /> Library
                </button>
                <button onClick={() => setShowExportPanel(true)}>
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

            {/* Export Panel */}
            {showExportPanel && (
                <div className="export-panel">
                    <h3>Export Scene</h3>
                    {isExporting ? (
                        <div className="loading-indicator">Exporting...</div>
                    ) : (
                        <div className="import-options">
                            <button onClick={() => handleExport("gltf")}>Export as GLTF</button>
                            <button onClick={() => handleExport("obj")}>Export as OBJ</button>
                            <button onClick={() => handleExport("fbx")}>Export as FBX</button>
                        </div>
                    )}
                    <button onClick={() => setShowExportPanel(false)}>Close</button>
                </div>
            )}

            {/* Library Panel */}
            {showLibraryPanel && (
                <div className="library-panel">
                    <h3>Library</h3>

                    <div className="library-content">
                        <div className="search-bar-container">
                            <input type="text" placeholder="Search..." className="search-input" />
                        </div>

                        <div className="library-categories">
                            <button className="category-button selected">All</button>
                            <button className="category-button">3D Icons</button>
                            <button className="category-button">Bag</button>
                            <button className="category-button">Bottles</button>
                            <button className="category-button">Boxes</button>
                            <button className="category-button">Buildings</button>
                            <button className="category-button">Character</button>
                            <button className="category-button">Christmas</button>
                            <button className="category-button">Cleaning</button>
                        </div>

                        <div className="library-items">
                            <div className="library-section">
                                <h4>3D Icons</h4>
                                <div className="library-grid">
                                    <div className="library-item">Key</div>
                                    <div className="library-item">Hurted Heart</div>
                                    <div className="library-item">Crystal Ball</div>
                                    <div className="library-item">Mouth</div>
                                </div>
                            </div>

                            <div className="library-section">
                                <h4>Bag</h4>
                                <div className="library-grid">
                                    <div className="library-item">Small Bag</div>
                                    <div className="library-item">Pouch Bag</div>
                                    <div className="library-item">Plastic Bag</div>
                                    <div className="library-item">Small Paper Bag</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="modal-buttons close-button" onClick={() => setShowLibraryPanel(false)}>
                        <FaTimes /> Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default HierarchyPanel;