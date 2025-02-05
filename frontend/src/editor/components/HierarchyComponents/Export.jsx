import React, { useState } from "react";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { FaFileExport } from "react-icons/fa";
import * as THREE from "three";

const Export = ({ scene }) => {
    const [showExportPanel, setShowExportPanel] = useState(false);
    const [showFileNameModal, setShowFileNameModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState("");
    const [fileName, setFileName] = useState("");

    const handleExport = (format) => {
        setExportFormat(format);
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

    const exportGLTF = (objects) => {
        const exporter = new GLTFExporter();
        const group = new THREE.Group();
        objects.forEach(obj => group.add(obj.clone()));

        exporter.parse(
            group,
            (result) => {
                const output = JSON.stringify(result, null, 2);
                const blob = new Blob([output], { type: "application/json" });
                downloadBlob(blob, `${fileName}.gltf`);
            },
            (error) => {
                console.error("Error exporting GLTF:", error);
            },
            { binary: false }
        );
    };

    const exportOBJ = (objects) => {
        const exporter = new OBJExporter();
        const group = new THREE.Group();
        objects.forEach(obj => group.add(obj.clone()));

        try {
            const objString = exporter.parse(group);
            const blob = new Blob([objString], { type: "text/plain" });
            downloadBlob(blob, `${fileName}.obj`);
        } catch (error) {
            console.error("Error exporting OBJ:", error);
        }
    };

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

    const downloadBlob = (blob, filename) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <button onClick={() => setShowExportPanel(true)}>
                <FaFileExport /> <span>Export</span>
            </button>

            {showExportPanel && (
                <div className="export-panel">
                    <h3>Export Scene</h3>
                    {isExporting ? (
                        <div className="loading-indicator">Exporting...</div>
                    ) : (
                        <div className="import-options">
                            <button onClick={() => handleExport("gltf")}>Export as GLTF</button>
                            <button onClick={() => handleExport("obj")}>Export as OBJ</button>
                            <button onClick={() => handleExport("stl")}>Export as STL</button>
                        </div>
                    )}
                    <button onClick={() => setShowExportPanel(false)}>Close</button>
                </div>
            )}

            {showFileNameModal && (
                <div className="file-name-modal">
                    <h3>Enter File Name</h3>
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Enter file name"
                    />
                    <div className="modal-buttons">
                        <button onClick={confirmExport}>Export</button>
                        <button onClick={() => setShowFileNameModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Export;
