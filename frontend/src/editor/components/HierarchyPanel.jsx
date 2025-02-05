import React, { useState } from "react";
import "../styles/hierarchyPanel.css";
import { FaTrash } from "react-icons/fa";
import Import from "./HierarchyComponents/Import";
import Export from "./HierarchyComponents/Export";
import Library from "./HierarchyComponents/Library";

const HierarchyPanel = ({ sceneObjects = [], selectedObjects, onImportScene, onObjectSelect, onObjectDelete, scene }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [objectToDelete, setObjectToDelete] = useState(null);

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
        setObjectToDelete(obj);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (objectToDelete) {
            onObjectDelete(objectToDelete.id);
            setShowDeleteModal(false);
            setObjectToDelete(null);
        }
    };

    return (
        <div className="hierarchy-panel">
            <h3>Objects</h3>
            <hr style={{
                border: "0",
                height: "1px",
                backgroundImage: "linear-gradient(to right, rgba(208, 200, 200, 0), rgba(103, 102, 102, 0.75), rgba(136, 130, 130, 0))"
            }}></hr>
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
                                key={obj.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "8px",
                                    backgroundColor: selectedObjects.includes(obj.id) ? "rgba(90, 90, 90, 0.8)" : "transparent",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    position: "relative",
                                }}
                                onClick={() => onObjectSelect([obj.id])}
                            >
                                <span style={{ flexGrow: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {obj.displayId}
                                </span>

                                <FaTrash
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        color: "rgba(255, 255, 255, 0.7)",
                                        cursor: "pointer",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(obj);
                                    }}
                                />
                            </li>
                            {index < objectsWithDynamicIds.length - 1 && <hr />}
                        </React.Fragment>
                    ))
                )}
            </ul>
            {
                showDeleteModal && (
                    <div className="delete-modal">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete <strong>{objectToDelete?.displayId}</strong>?</p>
                        <div className="modal-buttons-container">
                            <button className="modal-buttons" onClick={confirmDelete}>Delete</button>
                            <button className="modal-buttons" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                        </div>
                    </div>
                )
            }
            <div className="panel-buttons" style={{ marginLeft: "-10px" }}>
                <Import onImportScene={onImportScene} />
                <Library />
                <Export scene={scene} />
            </div>
        </div >
    );
};

export default HierarchyPanel;