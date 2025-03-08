// --- Export.jsx --- (Corrected getObjectByProperty and improved logging)
import React, { useState, useEffect, useRef } from "react";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { FaFileExport, FaTimes } from "react-icons/fa";
import * as THREE from "three";

const Export = ({ scene, sceneObjects }) => {
    const [showExportPanel, setShowExportPanel] = useState(false);
    const [showFileNameModal, setShowFileNameModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState("");
    const [fileName, setFileName] = useState("");

    const handleExport = (format) => {
        setExportFormat(format);
        setFileName("");
        setShowFileNameModal(true);
    };
    const confirmExport = () => {
        setIsExporting(true);
        if (!scene) {
            console.error("Scene is null or undefined.");
            alert("Scene is null or undefined. Cannot export.");
            setIsExporting(false);
            setShowFileNameModal(false);
            return;
        }

        // 1. Create a deep copy of the scene.
        const sceneCopy = scene.clone();
        console.log("Original scene:", scene); // Log the original scene
        console.log("Scene copy:", sceneCopy); // Log the copied scene
        console.log("sceneObjects:", sceneObjects)

        // 2. Apply properties from sceneObjects to the copied scene.
        if (sceneObjects) {
            sceneObjects.forEach((objectData) => {
                // Correctly find the object in the copied scene using userData.id
                const objectInScene = sceneCopy.getObjectByProperty("id", objectData.id);


                if (objectInScene) {
                    console.log("Found object in scene:", objectInScene);

                    // Apply position, rotation, and scale.
                    objectInScene.position.set(...objectData.position);
                    objectInScene.rotation.set(...objectData.rotation.map(THREE.MathUtils.degToRad));
                    objectInScene.scale.set(...objectData.scale);


                    // Apply material properties IF it's a mesh and has a material.
                    if (objectInScene.isMesh && objectInScene.material) {
                        console.log("Applying material properties to:", objectInScene);
                        if (objectData.material.color) {
                            objectInScene.material.color.set(objectData.material.color);
                        }
                        if (objectData.material.metalness !== undefined) {
                            objectInScene.material.metalness = objectData.material.metalness;
                        }
                        if (objectData.material.roughness !== undefined) {
                            objectInScene.material.roughness = objectData.material.roughness;
                        }
                        if (objectData.material.castShadow !== undefined) {
                            objectInScene.castShadow = objectData.material.castShadow;
                        }
                        if (objectData.material.receiveShadow !== undefined) {
                            objectInScene.receiveShadow = objectData.material.receiveShadow;
                        }
                    }
                } else {
                    console.warn(`Object with id ${objectData.id} not found in the copied scene.`);
                }
            });
        } else {
            console.warn("sceneObjects is null or undefined.");
        }

        // 3. Export the copied scene.
        switch (exportFormat) {
            case "gltf":
                exportGLTF(sceneCopy);
                break;
            case "obj":
                exportOBJ(sceneCopy);
                break;
            case "stl":
                exportSTL(sceneCopy);
                break;
            default:
                break;
        }

        setShowFileNameModal(false);
        setShowExportPanel(false);
    };


    const exportGLTF = (sceneToExport) => {
        const exporter = new GLTFExporter();

        exporter.parse(
            sceneToExport,
            (result) => {
                const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
                downloadBlob(blob, `${fileName}.gltf`);
                setIsExporting(false);
            },
            (error) => {
                console.error("Error exporting GLTF:", error);
                alert(`Error exporting GLTF: ${error.message}`);
                setIsExporting(false);
            },
            { binary: false, embedImages: true }
        );
    };

    const exportOBJ = (sceneToExport) => {
        const exporter = new OBJExporter();
        try {
            const result = exporter.parse(sceneToExport);
            const blob = new Blob([result], { type: "text/plain" });
            downloadBlob(blob, `${fileName}.obj`);
            setIsExporting(false);
        } catch (error) {
            console.error("Error exporting OBJ:", error);
            alert(`Error exporting OBJ: ${error.message}`);
            setIsExporting(false);
        }
    };

    const exportSTL = (sceneToExport) => {
        const exporter = new STLExporter();
        try {
            const stlString = exporter.parse(sceneToExport);
            const blob = new Blob([stlString], { type: "application/octet-stream" });
            downloadBlob(blob, `${fileName}.stl`);
            setIsExporting(false);
        } catch (error) {
            console.error("Error exporting STL:", error);
            alert(`Error exporting STL: ${error.message}`);
            setIsExporting(false);
        }
    };

    const downloadBlob = (blob, filename) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPanelRef = useRef(null);
    const fileNameModalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportPanelRef.current && !exportPanelRef.current.contains(event.target)) {
                setShowExportPanel(false);
            }
            if (fileNameModalRef.current && !fileNameModalRef.current.contains(event.target)) {
                setShowFileNameModal(false);
            }
        };

        if (showExportPanel || showFileNameModal) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showExportPanel, showFileNameModal]);

    const handleClosePanel = () => {
        setShowExportPanel(false);
    };

    return (
        // ... (JSX remains the same) ...
        <div>
            <button onClick={() => setShowExportPanel(true)}>
                <FaFileExport /> <span>Export</span>
            </button>

            {showExportPanel && (
                <div className="export-panel" ref={exportPanelRef}>
                    <h3>Export Scene</h3>
                    <FaTimes onClick={handleClosePanel} style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        cursor: "pointer",
                        fontSize: "20px",
                    }} />
                    {isExporting ? (
                        <div className="loading-indicator">Exporting...</div>
                    ) : (
                        <div className="import-options">
                            <button className="modal-buttons" onClick={() => handleExport("gltf")}>Export as GLTF</button>
                            <button className="modal-buttons" onClick={() => handleExport("obj")}>Export as OBJ</button>
                            <button className="modal-buttons" onClick={() => handleExport("stl")}>Export as STL</button>
                        </div>
                    )}
                </div>
            )}

            {showFileNameModal && (
                <div className="file-name-modal" ref={fileNameModalRef}>
                    <h3>Enter File Name</h3>
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Enter file name"
                        className="search-input"
                    />
                    <div className="import-options">
                        <button className="modal-buttons" onClick={confirmExport}>Export</button>
                        <button className="modal-buttons"
                            onClick={() => {
                                setShowFileNameModal(false);
                                setShowExportPanel(true);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Export;