// --- HierarchyPanel.jsx --- (Revised)
import React, { useState } from "react";
import "../styles/hierarchyPanel.css";
import { FaTrash, FaFileExport, FaFileImport, FaSave, FaCheck } from "react-icons/fa";
import Import from "./HierarchyComponents/Import";
import Export from "./HierarchyComponents/Export";
import Library from "./HierarchyComponents/Library";
import { saveScene, loadScene } from "./saveAndLoad";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HierarchyPanel = ({
  sceneObjects = [],
  selectedObjects,
  onObjectSelect,
  onObjectDelete,
  scene,
  setSceneObjects,
  setSceneSettings,
  sceneSettings,
  currentSceneName, // Receive currentSceneName
  onSceneNameChange, // Receive onSceneNameChange
  currentSceneId,
  setCurrentSceneId,
  canvasRef,
  onImportScene,
  SubscriptionLevel,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [objectToDelete, setObjectToDelete] = useState(null);
  const [showFileNameModal, setShowFileNameModal] = useState(false); // Still here for "Save As" if needed later
  const [showLoadSceneModal, setShowLoadSceneModal] = useState(false);
  const [userScenes, setUserScenes] = useState([]);
  const [fileName, setFileName] = useState("");  // Still here for "Save As"
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showTick, setShowTick] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL

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


  const handleSave = async () => {
    setIsSaving(true); // Set loading state to true
    let thumbnailBlob;
    if (canvasRef.current) {
      try {
        thumbnailBlob = await new Promise((resolve) => {
          canvasRef.current.toBlob(resolve, "image/png", 1); // Quality set to 0.9
        });
      } catch (error) {
        console.error("Error creating thumbnail blob:", error);
        setIsSaving(false); // Reset loading state
        alert("Failed to create thumbnail.");
        return; // Exit if thumbnail creation fails
      }
    }

    try {
        const response = await saveScene(
          sceneObjects,
          sceneSettings,
          currentSceneName,
          currentSceneId,
          thumbnailBlob
        );
        if (response && response.sceneId) {
          setCurrentSceneId(response.sceneId); // Update scene ID
          localStorage.setItem("currentSceneId", response.sceneId);
          onSceneNameChange(currentSceneName); //Keep the UI updated
          localStorage.setItem("currentSceneName", currentSceneName);
          setShowTick(true); // Show success tick
          setTimeout(() => {
            setShowTick(false);
            setIsSaving(false); // Reset loading state after delay
          }, 1000);
        }
      } catch (error) {
        console.error("Save failed:", error);
        setIsSaving(false);  // Make sure to reset loading if it fails.
        alert(`Save failed: ${error.message}`);
      }
  };

  const handleSceneSelect = (sceneId) => {
    if (!sceneId) {
      console.error("Invalid sceneId:", sceneId);
      return;
    }

    console.log("Loading scene with ID:", sceneId);

    loadScene(sceneId, setSceneObjects, setSceneSettings);
    setShowLoadSceneModal(false);
    setCurrentSceneId(sceneId);

    axios
      .get(`${API_BASE_URL}/get-scene-url?sceneId=${sceneId}`, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.status === 200) {
          onSceneNameChange(response.data.sceneName);
        }
      })
      .catch((error) => console.error("Error fetching scene name:", error));
  };

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

  const goBack = () => {
    navigate("/home");
  };

  return (
    <div className="hierarchy-panel">
      {/* Scene Name Input */}
      <div style={{ display: "inline-flex", marginLeft: "-20px" }}>
        <button
          onClick={goBack}
          style={{ marginRight: "-5px", marginTop: "-2px", backgroundColor: "transparent", border: "none", color: "white", cursor: "pointer" }}
        >
          ←
        </button>
        <input
          type="text"
          id="sceneName"
          value={currentSceneName}
          onChange={(e) => onSceneNameChange(e.target.value)} 
          className="scene-name-input"
          placeholder="Scene Name"
        />
      </div>
      <h3>Objects</h3>
      <div></div>
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
            Are you sure you want to delete{" "}
            <strong>{objectToDelete?.displayId}</strong>?
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

      <div className="panel-buttons" style={{ marginLeft: "-10px" }}>
        <Import onImportScene={onImportScene} />
        <Library onImportScene={onImportScene} />
        <Export scene={scene} sceneObjects={sceneObjects} />


        {SubscriptionLevel === "free" ? (
          <button className="custom-button" disabled>
            Subscribe to Save
          </button>
        ) : (
          <button className="custom-button" onClick={handleSave}>
            {isSaving ? "Saving..." : showTick ? <FaCheck /> : <FaSave />} Save
          </button>
        )}
 
    

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
              <button className="modal-buttons" onClick={confirmSave}>
                Save
              </button>
              <button
                className="modal-buttons"
                onClick={() => setShowFileNameModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Load Scene Modal */}
        {showLoadSceneModal && (
          <div className="load-scene-modal">
            <h3>Select a Scene to Load</h3>
            <ul className="scene-list">
              {userScenes.map((scene) => (
                <li
                  key={scene.scene_id}
                  onClick={() => handleSceneSelect(scene.scene_id)}
                >
                  {scene.scene_name}
                </li>
              ))}
            </ul>
            <button
              className="modal-buttons"
              onClick={() => setShowLoadSceneModal(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HierarchyPanel;