import React, { useState } from "react";
import "../styles/hierarchyPanel.css";
import { FaBook, FaFileExport, FaFileImport, FaSpinner, FaTrash, FaTimes } from "react-icons/fa";
import Import from "./HierarchyComponents/Import";
import Export from "./HierarchyComponents/Export";
import Library from "./HierarchyComponents/Library";

const HierarchyPanel = ({ sceneObjects = [], selectedObjects, onImportScene, onObjectDelete, scene }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredObjects = sceneObjects ? sceneObjects.filter((obj) =>
        obj.type.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

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
            onObjectDelete(obj.id);
        }
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
                <Import onImportScene={onImportScene} /> {/* No need to pass setIsLoading */}
                <Library />
                <Export scene={scene} />
            </div>
        </div>
    );
};

export default HierarchyPanel;