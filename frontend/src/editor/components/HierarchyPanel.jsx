// HierarchyPanel.jsx
import React, { useState, useRef } from "react";
import "../styles/hierarchyPanel.css";
import { FaTrash, FaFileExport, FaFileImport } from "react-icons/fa";
import Import from "./HierarchyComponents/Import";
import Export from "./HierarchyComponents/Export";
import Library from "./HierarchyComponents/Library";
import { saveScene, loadScene } from "./saveAndLoad"; // Import the functions


const HierarchyPanel = ({
  sceneObjects = [],
  selectedObjects,
  onImportScene,
  onObjectSelect,
  onObjectDelete,
  scene,
  setSceneObjects,
  setSceneSettings,
  sceneSettings, // Add sceneSettings as a prop
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [objectToDelete, setObjectToDelete] = useState(null);
  const [showFileNameModal, setShowFileNameModal] = useState(false); //for save file name
  const [fileName, setFileName] = useState(""); //for save file name

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredObjects = sceneObjects
    ? sceneObjects.filter((obj) =>
        obj.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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

   const handleSave = () => {
        setShowFileNameModal(true);
    };

    const confirmSave = () => {
        if (fileName) {
            saveScene(sceneObjects, sceneSettings, fileName); // Use sceneSettings from props
             setShowFileNameModal(false);
              setFileName(""); // Reset for next save
        } else {
           alert("please enter a file name")
        }
    };

   const handleImportArtxThree = (event) => {
    const file = event.target.files[0];
    if (file) {
      loadScene(file, setSceneObjects, setSceneSettings); // Use imported function
    }
  };

  return (
    <div className="hierarchy-panel">
      <h3>Objects</h3>
      {/* ... (rest of your HierarchyPanel code remains unchanged) ... */}
      <ul className="objects-list">
        {filteredObjects.length === 0 ? (
          <p className="no-objects">No models added</p>
        ) : (
          filteredObjects.map((obj, index) => (
            <React.Fragment key={`${obj.type}-${obj.id}`}>
              <li
                key={obj.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "7px",
                  backgroundColor: selectedObjects.includes(obj.id)
                    ? "rgba(90, 90, 90, 0.8)"
                    : "transparent", //use obj.id here
                  borderRadius: "5px",
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={() => onObjectSelect([obj.id])} // Pass obj.id as an array
              >
                {/* Render the shape or light SVG icon */}
                {/* <span style={{ width: "25px", height: "25px", marginRight: "8px", color: 'black' }}>
                                      {shapeIcons[obj.type] || lightIcons[obj.type] }
                                </span> */}
                <span
                  style={{
                    flexGrow: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {obj.displayId || obj.type}
                </span>

                <FaTrash
                  style={{
                    position: "absolute",
                    right: "10px",
                    color: "rgba(255, 255, 255, 0.93)",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(obj);
                  }}
                />
              </li>
              {index < filteredObjects.length - 1 && <hr />}
            </React.Fragment>
          ))
        )}
      </ul>
      {showDeleteModal && (
        <div className="delete-modal">
          <h3>Confirm Deletion</h3>
          <p>
            Are you sure you want to delete <strong>{objectToDelete?.displayId}</strong>?
          </p>
          <div className="modal-buttons-container">
            <button className="modal-buttons" onClick={confirmDelete}>
              Delete
            </button>
            <button
              className="modal-buttons"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- Save and Load Buttons --- */}
      <div className="panel-buttons" style={{ marginLeft: "-10px" }}>
          <Import onImportScene={onImportScene} />
          <Library />
          <Export scene={scene} />
          {/* Load Button (Hidden Input) */}
            <input
              type="file"
              accept=".artxthree"
              onChange={handleImportArtxThree}
              style={{ display: "none" }}
              id="import-artxthree"
            />
            <label htmlFor="import-artxthree" className="custom-button">
               <FaFileImport /> Import .artxthree
            </label>
            {/* Save Button */}
            <button onClick={handleSave} className="custom-button">
               <FaFileExport/> Save .artxthree
            </button>

            {/*file name modal*/}
            {showFileNameModal && (
                <div className="file-name-modal">
                    <h3>Enter File Name</h3>
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Enter file name"
                        className="search-input"
                    />
                    <div className="import-options">
                        <button className="modal-buttons" onClick={confirmSave}>Save</button>
                        <button className="modal-buttons"
                            onClick={() => {
                                setShowFileNameModal(false);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
      </div>
    </div>
  );
};

export default HierarchyPanel;