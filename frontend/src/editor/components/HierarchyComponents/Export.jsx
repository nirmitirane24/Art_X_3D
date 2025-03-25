import React, { useState , useEffect} from "react";
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

    const confirmExport = async () => {
        setIsExporting(true);

        if (!scene) {
            console.error("Scene is null or undefined.");
            alert("Scene is null or undefined. Cannot export.");
            setIsExporting(false);
            setShowFileNameModal(false);
            return;
        }

        try {
            if (exportFormat === "png") {
                await exportPNG();
            } else {
                const sceneCopy = scene.clone();
                applySceneObjectProperties(sceneCopy);

                switch (exportFormat) {
                    case "gltf":
                        await exportGLTF(sceneCopy);
                        break;
                    case "obj":
                        await exportOBJ(sceneCopy);
                        break;
                    case "stl":
                        await exportSTL(sceneCopy);
                        break;
                    default:
                        console.error("Unknown export format:", exportFormat);
                }
            }
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed. Please try again.");
        } finally {
            setIsExporting(false);
            setShowFileNameModal(false);
            setShowExportPanel(false);
        }
    };

    const applySceneObjectProperties = (sceneCopy) => {
        if (sceneObjects) {
            sceneObjects.forEach((objectData) => {
                const objectInScene = sceneCopy.getObjectByProperty("uuid", objectData.id);
                if (objectInScene) {
                    objectInScene.position.set(...objectData.position);
                    objectInScene.rotation.set(...objectData.rotation.map(THREE.MathUtils.degToRad));
                    objectInScene.scale.set(...objectData.scale);

                    if (objectInScene.isMesh && objectInScene.material) {
                        objectInScene.material.color.set(objectData.material.color || "#ffffff");
                        objectInScene.material.metalness = objectData.material.metalness || 0;
                        objectInScene.material.roughness = objectData.material.roughness || 0.5;
                        objectInScene.castShadow = objectData.material.castShadow || false;
                        objectInScene.receiveShadow = objectData.material.receiveShadow || false;
                    }
                }
            });
        }
    };

    const exportPNG = async () => {
        try {
            // Get the canvas from the DOM
            const canvas = document.querySelector('canvas');
            if (!canvas) {
                throw new Error("Canvas element not found");
            }

            // Create a new renderer if needed
            const renderer = new THREE.WebGLRenderer({
                canvas,
                preserveDrawingBuffer: true,
                antialias: true
            });

            // Get the camera from the scene
            const camera = new THREE.PerspectiveCamera(90, canvas.width / canvas.height, 0.1, 1000);
            camera.position.copy(scene.position);
            camera.position.z += 10;
            camera.lookAt(scene.position);

            // Configure renderer
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.setClearColor(scene.background || 0x000000);
            renderer.clear();

            // Render scene
            renderer.render(scene, camera);

            // Create and download the image
            const dataURL = canvas.toDataURL('image/png');
            const a = document.createElement("a");
            a.href = dataURL;
            a.download = `${fileName || 'scene'}.png`;
            a.click();
        } catch (error) {
            console.error("Error exporting PNG:", error);
            throw error;
        }
    };

    // Rest of the component remains exactly the same...
    const exportGLTF = async (sceneToExport) => {
        const exporter = new GLTFExporter();
        exporter.parse(sceneToExport, (result) => {
            const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
            downloadBlob(blob, `${fileName}.gltf`);
        }, { binary: false, embedImages: true });
    };

    const exportOBJ = async (sceneToExport) => {
        const exporter = new OBJExporter();
        const result = exporter.parse(sceneToExport);
        const blob = new Blob([result], { type: "text/plain" });
        downloadBlob(blob, `${fileName}.obj`);
    };

    const exportSTL = async (sceneToExport) => {
        const exporter = new STLExporter();
        const stlString = exporter.parse(sceneToExport);
        const blob = new Blob([stlString], { type: "application/octet-stream" });
        downloadBlob(blob, `${fileName}.stl`);
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
            <button onClick={() => setShowExportPanel(true)} disabled={isExporting}>
                <FaFileExport /> <span>Export</span>
            </button>

            {showExportPanel && (
                <div className="export-panel">
                    <h3>Export Scene</h3>
                    <FaTimes className="close-icon" onClick={() => setShowExportPanel(false)} />

                    {isExporting ? (
                        <div className="loading-indicator">Exporting...</div>
                    ) : (
                        <div className="export-options">
                            <button onClick={() => handleExport("gltf")} disabled={isExporting}>Export as GLTF</button>
                            <button onClick={() => handleExport("obj")} disabled={isExporting}>Export as OBJ</button>
                            <button onClick={() => handleExport("stl")} disabled={isExporting}>Export as STL</button>
                            <button onClick={() => handleExport("png")} disabled={isExporting}>Export as PNG</button>
                        </div>
                    )}
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
                    <button onClick={confirmExport} disabled={isExporting || !fileName.trim()}>
                        {isExporting ? "Exporting..." : "Export"}
                    </button>
                    <button onClick={() => setShowFileNameModal(false)} disabled={isExporting}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default Export;