//(PropertiesPanel.jsx should be the corrected version from the *previous* response.
// Make sure it's passing `selectedObjects` to SceneEditor!)

import React, { useState, useRef, useEffect } from "react";
import "../styles/propertiesPanel.css";
import MaterialEditor from "./PropertiesComponents/MaterialEditor";
import SceneEditor from "./PropertiesComponents/SceneEditor";
import VisibilityControls from "./PropertiesComponents/VisibilityControls";
import ShadowControls from "./PropertiesComponents/ShadowControls";
import LightProperties from "./PropertiesComponents/LightProperties";

const PropertiesPanel = ({
    selectedObjects,
    sceneObjects,
    updateObject,
    sceneSettings,
}) => {
    const [isMaterialEditorOpen, setMaterialEditorOpen] = useState(false);
    const [dragging, setDragging] = useState({
        prop: null,
        axis: null,
        startX: 0,
        startValue: 0,
    });
    const [inputValue, setInputValue] = useState({});
    const materialEditorButtonRef = useRef(null);

    // --- DROPDOWN STATE ---
    const [selectedLightId, setSelectedLightId] = useState(null);

    // Get the selected object (from Hierarchy Panel clicks)
    const selectedObject =
        selectedObjects.length === 1
            ? sceneObjects.find((obj) => obj.id === selectedObjects[0])
            : null;

    // --- DROPDOWN HANDLER ---
    const handleLightSelect = (event) => {
        setSelectedLightId(Number(event.target.value)); // Keep IDs as numbers
    };

    // Filter for light objects
    const lightObjects = sceneObjects.filter(obj =>
        obj.type === 'pointLight' || obj.type === 'spotLight' || obj.type === 'directionalLight'
    );

    // Find selected light using the dropdown's ID.  This is used *only* if a light
    // is selected from the dropdown.
    const selectedLight = lightObjects.find(light => light.id === selectedLightId);

    // Determine which object to use for property updates.  Prioritize `selectedObject`.
    const activeObject = selectedObject || selectedLight;

    const handlePropertyChange = (propName, value) => {
        if (activeObject) {
            updateObject(activeObject.id, { [propName]: value });
        }
    };


   const handleInputChange = (event, prop, axis) => {
        const value = parseFloat(event.target.value);
          if (!isNaN(value)) {
            let updatedValue;
            // Use selectedLight for light properties
            const targetObject = activeObject;

            if (Array.isArray(targetObject[prop])) {
              updatedValue = targetObject[prop].map((val, index) =>
                index === axis ? value : val
              );
            } else {
              updatedValue = value;
            }

            handlePropertyChange(prop, updatedValue);  // Call the correct handler
            setInputValue((prev) => ({
              ...prev,
              [`${prop}-${axis}`]: value,
            }));
          }
      };

      const startDrag = (event, prop, axis, startValue) => {
        setDragging({ prop, axis, startX: event.clientX, startValue });
      };

  const handleDrag = (event) => {
    if (!dragging.prop) return;

    const deltaX = event.clientX - dragging.startX;
    const sensitivity = 0.05;
    const angleSensitivity = 0.01; // For angles
    let newValue = dragging.startValue + deltaX * (dragging.prop === 'angle' ? angleSensitivity : sensitivity);

    // Use selectedLight if it exists, otherwise use selectedObject
    const targetObject = activeObject;

    if (targetObject && (dragging.prop === "position" || dragging.prop === "rotation" || dragging.prop === "scale" || dragging.prop === "angle")) {
      let updatedValues;

      if (Array.isArray(targetObject[dragging.prop])) {
        updatedValues = targetObject[dragging.prop].map((val, index) =>
          index === dragging.axis ? newValue : val
        );
      } else {
        updatedValues = newValue;
      }

      handlePropertyChange(dragging.prop, updatedValues);
      setInputValue((prev) => ({
        ...prev,
        [`${dragging.prop}-${dragging.axis}`]: newValue,
      }));
    }
  };

    const endDrag = () => {
        setDragging({ prop: null, axis: null, startX: 0, startValue: 0 });
    };

    useEffect(() => {
        if (dragging.prop) {
            window.addEventListener("mousemove", handleDrag);
            window.addEventListener("mouseup", endDrag);
        }
        return () => {
            window.removeEventListener("mousemove", handleDrag);
            window.removeEventListener("mouseup", endDrag);
        };
    }, [dragging, activeObject]); // Add dependencies correctly

    useEffect(() => {
        setInputValue({});
    }, [activeObject]);


    const handleMaterialChange = (newMaterial) => {
        if (selectedObject && selectedObject.material) {
            updateObject(selectedObject.id, {
                material: { ...selectedObject.material, ...newMaterial },
            });
        }
    };

    const toggleMaterialEditor = () => {
        setMaterialEditorOpen(!isMaterialEditorOpen);
    };


    return (
        <>
            <div className="properties-panel">
                <h3>Properties</h3>

                {/* --- Conditionally Render Based on Selection --- */}
                {!activeObject ? (
                    // Nothing selected: Show Scene Editor
                    <SceneEditor
                        sceneObjects={sceneObjects}  //pass sceneObjects to sceneeditor
                        updateObject={updateObject}
                        sceneSettings={sceneSettings}
                        selectedObjects={selectedObjects} // Pass selectedObjects
                    />
                ) : selectedObject ? (
                    // Mesh selected: Show mesh properties
                    <>
                        <div>
                            <h4>Selected : {selectedObject.type} </h4>
                        </div>
                        <hr className="style-six"></hr>
                        <div className="slider-group">
                            <div className="slider-row">
                                <h4>Position</h4>
                                {selectedObject.position && selectedObject.position.map((value, index) => (
                                    <div key={`position-${index}`} className="slider-input-group">
                                        <div
                                            className="horizontal-slider"
                                            onMouseDown={(e) => startDrag(e, "position", index, value)}
                                        >
                                            <div
                                                className="slider-thumb"
                                                style={{ left: `${value * 20}px` }}
                                            ></div>
                                        </div>
                                        <input
                                            type="text"
                                            className="number-input"
                                            value={
                                                inputValue[`position-${index}`] === undefined
                                                    ? value
                                                    : inputValue[`position-${index}`]
                                            }
                                            onChange={(e) => handleInputChange(e, "position", index)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {selectedObject.rotation && (
                            <div className="slider-group">
                                <div className="slider-row">
                                    <h4>Rotation</h4>
                                    {selectedObject.rotation.map((value, index) => (
                                        <div key={`rotation-${index}`} className="slider-input-group">
                                            <div
                                                className="horizontal-slider"
                                                onMouseDown={(e) => startDrag(e, "rotation", index, value)}
                                            >
                                                <div
                                                    className="slider-thumb"
                                                    style={{ left: `${value * 20}px` }}
                                                ></div>
                                            </div>
                                            <input
                                                type="text"
                                                className="number-input"
                                                value={
                                                    inputValue[`rotation-${index}`] === undefined
                                                        ? value
                                                        : inputValue[`rotation-${index}`]
                                                }
                                                onChange={(e) => handleInputChange(e, "rotation", index)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedObject.scale && (
                        <div className="slider-group">
                            <div className="slider-row">
                                <h4>Scale</h4>
                                {selectedObject.scale.map((value, index) => (
                                    <div key={`scale-${index}`} className="slider-input-group">
                                        <div
                                            className="horizontal-slider"
                                            onMouseDown={(e) => startDrag(e, "scale", index, value)}
                                        >
                                            <div
                                                className="slider-thumb"
                                                style={{ left: `${value * 20}px` }}
                                            ></div>
                                        </div>
                                        <input
                                            type="text"
                                            className="number-input"
                                            value={
                                                inputValue[`scale-${index}`] === undefined
                                                    ? value
                                                    : inputValue[`scale-${index}`]
                                            }
                                            onChange={(e) => handleInputChange(e, "scale", index)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}
                        <div>
                            <hr className="style-six"></hr>
                            {selectedObject.material && (
                                <>
                                <button
                                    className="material-editor-button"
                                    onClick={toggleMaterialEditor}
                                    ref={materialEditorButtonRef}
                                >
                                    {isMaterialEditorOpen ? " Material Editor" : " Material Editor"}
                                </button>
                            {isMaterialEditorOpen && (
                                <div
                                    className="material-editor-popout"
                                    style={{
                                        position: "absolute",
                                        left: materialEditorButtonRef.current
                                            ? materialEditorButtonRef.current.offsetLeft - 310
                                            : 0,
                                        top: materialEditorButtonRef.current
                                            ? materialEditorButtonRef.current.offsetTop
                                            : 0,
                                    }}
                                >
                                    <MaterialEditor
                                        material={selectedObject.material}
                                        onChange={handleMaterialChange}
                                        onClose={toggleMaterialEditor}
                                    />
                                </div>
                            )}
                            <hr className="style-six"></hr>
                            </>
                            )}

                        </div>
                        <VisibilityControls
                            object={selectedObject}
                            updateObject={updateObject}
                        />
                        <hr className="style-six"></hr>
                        <ShadowControls object={selectedObject} updateObject={updateObject} />
                        <hr className="style-six"></hr>
                    </>
                ) : (
                    // Light selected (either dropdown or Hierarchy): Show LightProperties
                    <>
                       {/* <div className="light-dropdown-container">
                        <h4>Select Light:</h4>
                        <select value={selectedLightId || ''} onChange={handleLightSelect} className="light-dropdown">
                            <option value="">Select a Light</option>
                            {lightObjects.map((light) => (
                                <option key={light.id} value={light.id}>
                                    {light.displayId}
                                </option>
                            ))}
                        </select>
                      </div>
                    <LightProperties
                        selectedObject={activeObject}  //Pass the active object
                        updateObject={updateObject}
                         handleInputChange={handleInputChange}
                        startDrag={startDrag}
                        inputValue={inputValue}
                    /> */}
                     <SceneEditor
                        sceneObjects={sceneObjects}
                        updateObject={updateObject}
                        sceneSettings={sceneSettings}
                        selectedObjects={selectedObjects}
                    />
                    </>
                )}
            </div>
            {isMaterialEditorOpen && selectedObject && selectedObject.material &&(
                <div
                    className="material-editor-popout"
                    style={{
                        position: "absolute",
                        left: materialEditorButtonRef.current
                            ? materialEditorButtonRef.current.offsetLeft - 310
                            : 0,
                        top: materialEditorButtonRef.current
                            ? materialEditorButtonRef.current.offsetTop
                            : 0,
                    }}
                >
                    <MaterialEditor
                        material={selectedObject.material}
                        onChange={handleMaterialChange}
                        onClose={toggleMaterialEditor}
                    />
                </div>
            )}
        </>
    );
};

export default PropertiesPanel;