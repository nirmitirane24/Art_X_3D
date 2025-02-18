// Toolbar.jsx
import React, { useState } from 'react';
import '../styles/toolbar.css';
import ShapeButton from './toolbar/ShapeButton';
import LightButton from './toolbar/LightButton'; // Import LightButton
import { FaUndo, FaRedo, FaSave } from 'react-icons/fa'; // Import FaSave
import axios from "axios";


const basicShapes = ['cube', 'sphere']; // Basic shapes always visible
const advancedShapes = [
    'cylinder',
    'cone',
    'torus',
    'plane',
    'ring',
    'dodecahedron',
    'tetrahedron',
    'octahedron',
    'icosahedron',
    'capsule',
    'lathe',
];

const lightTypes = ['pointLight', 'spotLight', 'directionalLight'];


const Toolbar = ({
  onAddModel,
  onAddLight,
  selectedObjects,
  onUndo,
  onRedo,
  undoDisabled,
  redoDisabled,
  currentSceneId, // Receive currentSceneId
    currentSceneName,
    setCurrentSceneName,
}) => {
    const [showShapes, setShowShapes] = useState(false);
    const [showLights, setShowLights] = useState(false);


    const toggleShapes = () => {
        setShowShapes(!showShapes);
    };

    const toggleLights = () => {
        setShowLights(!showLights);
    }
  const handleSave = async () => {
    if (!currentSceneName) { //scene name must be present
      alert("Please enter a scene name before saving.");
      return;
    }

    const formData = new FormData();
    formData.append("sceneName", currentSceneName); // Use currentSceneName
    formData.append("username", localStorage.getItem("username"));

    // Get the Three.js scene data
    const sceneData = document.querySelector("canvas").toDataURL();
    const blob = await (await fetch(sceneData)).blob();
    formData.append("sceneFile", blob, `${currentSceneName}.artxthree`);

     if (currentSceneId) {
            formData.append('sceneId', currentSceneId);  // Include sceneId if available
        }

    try {
      const response = await axios.post(
        "http://localhost:5050/save",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
       if (response.status === 200) {
                console.log("Scene saved successfully:", response.data);
                alert(response.data.message); // Show success message
                  if (!currentSceneId) {
                    setCurrentSceneName(response.data.sceneName);
                    setCurrentSceneId(response.data.sceneId); // Update currentSceneId after first save
                  }
            } else {
                console.error("Scene save failed:", response);
                alert("Failed to save scene.");
            }

    } catch (error) {
      console.error("Error saving scene:", error);
      alert(`Error saving scene: ${error.response.data.error}`);
    }
  };
    return (
        <div className="toolbar">
            <div className="undo-redo-buttons">
            <button
                    onClick={onUndo}
                    disabled={undoDisabled}
                    className={`undo-redo-buttons ${undoDisabled ? 'disabled' : 'enabled'}`}
                >
                    <FaUndo />
                </button>
                <button
                    onClick={onRedo}
                    disabled={redoDisabled}
                    className={`undo-redo-buttons ${redoDisabled ? 'disabled' : 'enabled'}`}
                >
                    <FaRedo />
                </button>
            </div>
            <hr className='vertical-line'></hr>

            {/* Edit Mode Button with Conditional Styling */}
            {selectedObjects.length > 0 ? (
                <button className="edit-mode-button enabled">Edit Mode</button>
            ) : (
                <button className="edit-mode-button disabled">Edit Mode</button>
            )}
            {/* <hr className='vertical-line'></hr> */}
             {/* <button onClick={handleSave} title="Save Scene" className='save-button'>
                <FaSave />
            </button> */}
              <hr className='vertical-line'></hr>
            {/* Basic shapes always visible */}
            <div className="basic-shapes">
                {basicShapes.map((shape) => (
                    <ShapeButton key={shape} shape={shape} onAddModel={onAddModel} />
                ))}
            </div>

            <hr className='vertical-line'></hr>

            <div className="toolbar-section" onClick={toggleShapes}>
                <span className="toolbar-section-title">
                    {showShapes ? '▾' : '▸'} More Shapes
                </span>
                {showShapes && (
                    <div className="advanced-shape-buttons">
                        <div className="advanced-shapes-scroll">
                            {advancedShapes.map((shape) => (
                                <ShapeButton
                                    key={shape}
                                    shape={shape}
                                    onAddModel={onAddModel}
                                    isAdvancedShape={true}
                                />
                            ))}

                            <hr className='style-six'></hr>

                            {lightTypes.map((type) => (
                                <LightButton key={type} type={type} onAddLight={onAddLight} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
};

export default Toolbar;