import React, { useState } from "react";
import "../styles/hierarchyPanel.css";
import { FaBook, FaFileExport, FaFileImport } from "react-icons/fa";

const HierarchyPanel = ({ sceneObjects, onObjectSelect, selectedObjects }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showImportPanel, setShowImportPanel] = useState(false);

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

    const handleFileSelection = (acceptedFormats) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = acceptedFormats;
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log(`Selected file: ${file.name}`);
                // Add your file handling logic here
            }
        };
        input.click();
    };

    return (
        <div className="hierarchy-panel">
            <h3>Objects</h3>
            <hr />
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
                    <li className="no-objects">No models added</li>
                ) : (
                    objectsWithDynamicIds.map((obj, index) => (
                        <React.Fragment key={`${obj.type}-${obj.displayId}`}>
                            <li
                                className={selectedObjects.includes(obj.id) ? "selected" : ""}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onObjectSelect([obj.id]);
                                }}
                            >
                                <span className="object-type">{obj.displayId}</span>
                            </li>
                            {index < objectsWithDynamicIds.length - 1 && <hr />}
                        </React.Fragment>
                    ))
                )}
            </ul>

            <div className="panel-buttons" style={{ marginLeft: "-10px" }}>
                <button onClick={() => setShowImportPanel(true)}>
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
                    <h4>Import or Drag & Drop</h4>
                    <div className="import-options">
                        <button className="modal-buttons" onClick={() => handleFileSelection(".mp4")}>Video (MP4)</button>
                        <button className="modal-buttons"
                            onClick={() =>
                                handleFileSelection(".gltf,.stl,.fbx,.obj")
                            }
                        >
                            3D Model (GLTF, STL, FBX, OBJ)
                        </button>
                        <button className="modal-buttons" onClick={() => handleFileSelection(".mp3,.wav")}>
                            Sound (MP3, WAV)
                        </button>
                        <button className="modal-buttons" onClick={() => handleFileSelection(".svg")}>Vector (SVG)</button>
                        <button className="modal-buttons" onClick={() => handleFileSelection(".jpg,.png")}>
                            Image (JPG, PNG)
                        </button>
                        <button className="modal-buttons" onClick={() => handleFileSelection(".ply")}>
                            Gaussian Splat (PLY)
                        </button>
                    </div>
                    <button className="modal-buttons" onClick={() => setShowImportPanel(false)}>Close</button>
                </div>
            )}
        </div>
    );
};

export default HierarchyPanel;
