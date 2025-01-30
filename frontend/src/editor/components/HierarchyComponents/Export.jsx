import React, { useState } from "react";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import * as THREE from 'three';

const Export = ({ scene }) => {
    const [showExportPanel, setShowExportPanel] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = (format) => {
        setIsExporting(true);

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
        }

        setIsExporting(false);
        setShowExportPanel(false);
    };

    const exportGLTF = (objects) => {
        const exporter = new GLTFExporter();

        const group = new THREE.Group();
        objects.forEach(obj => group.add(obj.clone()));

        exporter.parse(
            group,
            (result) => {
                const isBinary = false;
                const output = isBinary ? result : JSON.stringify(result, null, 2);
                const blob = new Blob([output], { type: isBinary ? 'application/octet-stream' : 'application/json' });
                const filename = isBinary ? 'scene.glb' : 'scene.gltf';
                downloadBlob(blob, filename);
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
            downloadBlob(blob, "scene.obj");
            console.log("OBJ export successful!");
        } catch (error) {
            console.error("Error exporting OBJ:", error);
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
                Export
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
                        </div>
                    )}
                    <button onClick={() => setShowExportPanel(false)}>Close</button>
                </div>
            )}
        </div>
    );
};

export default Export;