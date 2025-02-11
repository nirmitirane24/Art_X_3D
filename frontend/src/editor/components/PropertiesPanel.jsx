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

  const selectedObject =
    selectedObjects.length === 1
      ? sceneObjects.find((obj) => obj.id === selectedObjects[0])
      : null;

  const handlePropertyChange = (propName, value) => {
    if (selectedObject) {
      updateObject(selectedObject.id, { [propName]: value });
    }
  };

  const handleInputChange = (event, prop, axis) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      let updatedValue;

      if (Array.isArray(selectedObject[prop])) {
        updatedValue = selectedObject[prop].map((val, index) =>
          index === axis ? value : val
        );
      } else {
        updatedValue = value;
      }

      handlePropertyChange(prop, updatedValue); // Call the correct handler

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
    let newValue =
      dragging.startValue +
      deltaX * (dragging.prop === "angle" ? angleSensitivity : sensitivity);

    if (
      selectedObject &&
      (dragging.prop === "position" ||
        dragging.prop === "rotation" ||
        dragging.prop === "scale" ||
        dragging.prop === "angle")
    ) {
      let updatedValues;

      if (Array.isArray(selectedObject[dragging.prop])) {
        updatedValues = selectedObject[dragging.prop].map((val, index) =>
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
  }, [dragging, selectedObject]); // Add dependencies correctly

  useEffect(() => {
    setInputValue({});
  }, [selectedObject]);

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
        {!selectedObject ? (
          // Nothing selected: Show Scene Editor
          <SceneEditor
            sceneObjects={sceneObjects} //pass sceneObjects to sceneeditor
            updateObject={updateObject}
            sceneSettings={sceneSettings}
            selectedObjects={selectedObjects} // Pass selectedObjects
          />
        ) : selectedObject.type === "cube" ||
          selectedObject.type === "sphere" ||
          selectedObject.type === "cylinder" ||
          selectedObject.type === "cone" ||
          selectedObject.type === "torus" ||
          selectedObject.type === "plane" ||
          selectedObject.type === "ring" ||
          selectedObject.type === "dodecahedron" ||
          selectedObject.type === "tetrahedron" ||
          selectedObject.type === "octahedron" ||
          selectedObject.type === "icosahedron" ||
          selectedObject.type === "capsule" ||
          selectedObject.type === "lathe" ? (
          // Mesh selected: Show mesh properties
          <>
            <div>
              <h4>Selected : {selectedObject.type} </h4>
            </div>
            <hr className="style-six"></hr>
            <div className="slider-group">
              <div className="slider-row">
                <h4>Position</h4>
                {selectedObject.position &&
                  selectedObject.position.map((value, index) => (
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
                  {selectedObject.rotation.slice(0, 3).map((value, index) => (
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
                    {isMaterialEditorOpen
                      ? " Material Editor"
                      : " Material Editor"}
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
          // Light selected: Show LightProperties
          <>
            <div>
              <h4>Selected : {selectedObject.type} </h4>
            </div>
            <LightProperties
              selectedObject={selectedObject} //Pass the active object
              updateObject={updateObject}
              handleInputChange={handleInputChange}
              startDrag={startDrag}
              inputValue={inputValue}
            />
          </>
        )}
      </div>
      {isMaterialEditorOpen && selectedObject && selectedObject.material && (
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