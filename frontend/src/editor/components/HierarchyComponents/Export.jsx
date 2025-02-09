import React, { useState, useEffect, useRef } from "react";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { FaFileExport, FaTimes } from "react-icons/fa";
import * as THREE from "three";

const Export = ({ scene }) => {
    const [showExportPanel, setShowExportPanel] = useState(false);
    const [showFileNameModal, setShowFileNameModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState("");
    const [fileName, setFileName] = useState("");

    const handleExport = (format) => {
        setExportFormat(format);
        setFileName(""); // Reset file name input field
        setShowFileNameModal(true);
    };

    const confirmExport = () => {
        setIsExporting(true);
        const objectsToExport = scene.children.filter(obj => obj.name !== "GroundPlane" && obj instanceof THREE.Object3D);

        if (objectsToExport.length === 0) {
            console.error("No valid objects to export.");
            setIsExporting(false);
            return;
        }

        switch (exportFormat) {
            case "gltf":
                exportGLTF(objectsToExport);
                break;
            case "obj":
                exportOBJ(objectsToExport);
                break;
            case "stl":
                exportSTL(objectsToExport);
                break;
            default:
                break;
        }

        setIsExporting(false);
        setShowFileNameModal(false);
        setShowExportPanel(false);
    };

    // === GLTF EXPORT WITH TEXTURES ===
    const exportGLTF = (objects) => {
        const exporter = new GLTFExporter();
        const group = new THREE.Group();
        objects.forEach(obj => group.add(obj.clone()));

        exporter.parse(
            group,
            (result) => {
                const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
                downloadBlob(blob, `${fileName}.gltf`);
            },
            (error) => {
                console.error("Error exporting GLTF:", error);
            },
            { binary: false, embedImages: true } // Ensures textures are embedded
        );
    };

    const exportOBJ = (objects) => {
        const exporter = new OBJExporter();
        const group = new THREE.Group();

        objects.forEach(obj => {
            const clonedObj = obj.clone();
            clonedObj.userData.id = obj.uuid; // Store unique ID
            group.add(clonedObj);
        });

        try {
            let objString = "# Exported OBJ with embedded textures\n";

            // Export object shape names & IDs
            objects.forEach(obj => {
                objString += `# Object: ${obj.name}, ID: ${obj.uuid}\n`;
            });

            // Generate OBJ file content
            objString += exporter.parse(group);

            // Process textures and embed them as Base64
            const texturePromises = objects.map(obj => {
                if (obj.material && obj.material.map && obj.material.map.image) {
                    return convertTextureToBase64(obj.material.map.image).then(base64 => {
                        objString += `# Embedded Texture for ${obj.name}: data:image/jpeg;base64,${base64}\n`;
                    });
                }
                return Promise.resolve();
            });

            // After processing all textures, save the file
            Promise.all(texturePromises).then(() => {
                const blob = new Blob([objString], { type: "text/plain" });
                downloadBlob(blob, `${fileName}.obj`);
            });

        } catch (error) {
            console.error("Error exporting OBJ:", error);
        }
    };

    // ✅ Convert texture to Base64
    const convertTextureToBase64 = (image) => {
        return new Promise((resolve) => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);

            resolve(canvas.toDataURL("image/jpeg").split(",")[1]); // Extract Base64
        });
    };

    // === STL EXPORT (STL DOES NOT SUPPORT TEXTURES) ===
    const exportSTL = (objects) => {
        const exporter = new STLExporter();
        const group = new THREE.Group();
        objects.forEach(obj => group.add(obj.clone()));

        try {
            const stlString = exporter.parse(group);
            const blob = new Blob([stlString], { type: "application/octet-stream" });
            downloadBlob(blob, `${fileName}.stl`);
        } catch (error) {
            console.error("Error exporting STL:", error);
        }
    };

    // === Helper to Download Blob ===
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

    // Close panels when clicking outside
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

        if (showFileNameModal) {
            setShowExportPanel(false);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showExportPanel, showFileNameModal]);

    const handleClosePanel = () => {
        setShowExportPanel(false);
    };

    return (
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
                                setShowExportPanel(true); // Reopen Export Panel when Cancel is clicked
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
