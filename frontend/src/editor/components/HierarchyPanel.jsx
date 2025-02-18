// --- HierarchyPanel.jsx ---
import React, { useState } from "react";
import "../styles/hierarchyPanel.css";
import { FaTrash, FaFileExport, FaFileImport } from "react-icons/fa";
import Import from "./HierarchyComponents/Import";
import Export from "./HierarchyComponents/Export";
import Library from "./HierarchyComponents/Library";
import { saveScene, loadScene } from "./saveAndLoad";
import axios from 'axios'; // Import axios


const HierarchyPanel = ({
  sceneObjects = [],
  selectedObjects,
  onObjectSelect,
  onObjectDelete,
  scene,
  setSceneObjects,
  setSceneSettings,
  sceneSettings,
  currentSceneName,
  onSceneNameChange,
  currentSceneId,
  setCurrentSceneId, // Add setCurrentSceneId

}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [objectToDelete, setObjectToDelete] = useState(null);
  const [showFileNameModal, setShowFileNameModal] = useState(false);
    const [showLoadSceneModal, setShowLoadSceneModal] = useState(false);
    const [userScenes, setUserScenes] = useState([]);
  const [fileName, setFileName] = useState("");

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

//MODIFIED
  const handleSave = () => {
      saveScene(sceneObjects, sceneSettings, currentSceneName); //removed file name
  };


const handleLoadSceneClick = async () => {
    try {
      const response = await axios.get('http://localhost:5050/scenes', {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUserScenes(response.data);
        setShowLoadSceneModal(true);
      } else {
        console.error('Failed to fetch user scenes:', response);
        alert('Failed to fetch scenes.');
      }
    } catch (error) {
      console.error('Error fetching user scenes:', error);
      alert(`Error fetching scenes: ${error.message}`);
    }
  };

  const handleSceneSelect = (sceneId) => {
    // Check if sceneId is valid before proceeding
    if (!sceneId) {
        console.error("Invalid sceneId:", sceneId);
        return; // Stop execution if sceneId is invalid
    }

    console.log("Loading scene with ID:", sceneId); // Debug log

    loadScene(sceneId, setSceneObjects, setSceneSettings);
    setShowLoadSceneModal(false);
    setCurrentSceneId(sceneId); // Update the current scene ID

    // Fetch the scene name (and any other metadata) when loading.
    axios.get(`http://localhost:5050/get-scene-url?sceneId=${sceneId}`, { withCredentials: true })
        .then(response => {
            if (response.status === 200) {
                onSceneNameChange(response.data.sceneName); // Update the name
            }
        })
        .catch(error => console.error("Error fetching scene name:", error));
};



    return (
        <div className="hierarchy-panel">
              <input
                type="text"
                id="sceneName"
                value={currentSceneName}
                onChange={(e) => onSceneNameChange(e.target.value)}
                className="scene-name-input"
            />
            <h3>Objects</h3>
            <div>

            </div>
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
                                        : "transparent",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    position: "relative",
                                }}
                                onClick={() => onObjectSelect([obj.id])}
                            >
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
                        Are you sure you want to delete <strong>{objectToDelete?.displayId}</strong>?</p>
                    <div className="modal-buttons-container">
                        <button className="modal-buttons" onClick={confirmDelete}>Delete</button>
                        <button className="modal-buttons" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="panel-buttons" style={{ marginLeft: "-10px" }}>
                <Import  />
                <Library />
                <Export  />

                {/* Load Scene Button */}
                {/* <button onClick={handleLoadSceneClick} className="custom-button">
                    <FaFileImport /> Load Scene
                </button> */}


                <button onClick={handleSave} className="custom-button">
                    Save
                </button>

                {showFileNameModal && ( //remove file name modal
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
                            <button className="modal-buttons" onClick={() => setShowFileNameModal(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                 {/* Load Scene Modal */}
                {showLoadSceneModal && (
                    <div className="load-scene-modal">
                        <h3>Select a Scene to Load</h3>
                        <ul className="scene-list">
                            {userScenes.map((scene) => (
                                <li key={scene.scene_id} onClick={() => handleSceneSelect(scene.scene_id)}>
                                    {scene.scene_name}
                                </li>
                            ))}
                        </ul>
                        <button className="modal-buttons" onClick={() => setShowLoadSceneModal(false)}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HierarchyPanel;