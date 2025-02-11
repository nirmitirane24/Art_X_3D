import React, { useState, useEffect, useRef } from 'react';
import './LightProperties.css';

const LightProperties = ({ selectedObject, updateObject, handleInputChange, startDrag, inputValue }) => {

    if (!selectedObject) {
        return null; // Or a placeholder
    }
      const handleTargetChange = (index, value) => {
        if (selectedObject && selectedObject.target) {
          const newTarget = [...selectedObject.target];
          newTarget[index] = parseFloat(value) || 0; // Ensure valid number
          updateObject(selectedObject.id, { target: newTarget });
        }
      };

      const startTargetDrag = (event, index) => {
        startDrag(event, "target", index, selectedObject.target[index]);
      };

      const renderTargetInputs = () => {
            return (
              <div className="light-props-row-xyz">
                <label className="light-props-label">Target:</label>
                <div className="light-props-input-column-xyz">
                  {selectedObject.target.map((value, index) => (
                    <input
                    key={`target-${index}`}
                    type="number"
                    className="light-props-input light-props-input-small"
                    value={value}
                    onChange={(e) => handleTargetChange(index, e.target.value)}
                    onMouseDown={(e) => startTargetDrag(e,index)}
                  />
                  ))}
                </div>
              </div>
            );
          };

    return (
        <div className="light-props-container">
            <h3 className="light-props-header">{selectedObject.type} Properties</h3>
            <hr className="light-props-separator" />

             <div className="light-props-row-xyz">
                <label className="light-props-label">Position:</label><nr></nr>
                <div className="light-props-input-column-xyz">
                 {selectedObject.position.map((value, index) => (
                    <input
                      type="text"
                      className="light-props-input light-props-input-small"
                      value={
                        inputValue[`position-${index}`] === undefined
                          ? value
                          : inputValue[`position-${index}`]
                      }
                      onChange={(e) => handleInputChange(e, 'position', index)}
                      onMouseDown={(e) => startDrag(e, 'position', index, value)}
                      key={`pos-${index}`}
                    />
                  ))}
                </div>
            </div>
            <hr className="light-props-separator" />

            {/* Target inputs (only for spotLight and directionalLight) */}
            {(selectedObject.type === 'spotLight' || selectedObject.type === 'directionalLight') && renderTargetInputs()}

            <div className="light-props-row">
                <label className="light-props-label light-props-label-column">Color:</label>
                <div className="light-props-input-column">
                    <input
                        type="color"
                        className="light-props-color-input"
                        value={selectedObject.color}
                        onChange={(e) => updateObject(selectedObject.id, { color: e.target.value })}
                    />
                </div>
            </div>
            <hr className="light-props-separator" />

            <div className="light-props-row">
                <label className="light-props-label light-props-label-column">Intensity:</label>
                <div className="light-props-input-column">
                    <input
                        type="number"
                        className="light-props-input"
                        value={selectedObject.intensity}
                        onChange={(e) => updateObject(selectedObject.id, { intensity: parseFloat(e.target.value) || 0 })}
                    />
                </div>
            </div>
            <hr className="light-props-separator" />

            {/* SpotLight-specific properties */}
            {selectedObject.type === 'spotLight' && (
                <>
                    <div className="light-props-row">
                        <label className="light-props-label light-props-label-column">Angle:</label>
                        <div className="light-props-input-column">
                            <input
                                type="number"
                                className="light-props-input"
                                 value={
                                    inputValue[`angle`] === undefined
                                      ? selectedObject.angle
                                      : inputValue[`angle`]
                                  }
                                  onChange={(e) => handleInputChange(e, "angle", null)}
                                    onMouseDown={(e) => startDrag(e, "angle", null, selectedObject.angle)} // For dragging angles
                            />
                        </div>
                    </div>
                    <hr className="light-props-separator" />
                    <div className="light-props-row">
                        <label className="light-props-label light-props-label-column">Penumbra:</label>
                        <div className="light-props-input-column">
                            <input
                                type="number"
                                className="light-props-input"
                                value={selectedObject.penumbra}
                                onChange={(e) => updateObject(selectedObject.id, { penumbra: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                     <hr className="light-props-separator" />
                    <div className="light-props-row">
                        <label className="light-props-label light-props-label-column">Distance:</label>
                        <div className="light-props-input-column">
                            <input
                                type="number"
                                className="light-props-input"
                                value={selectedObject.distance}
                                onChange={(e) => updateObject(selectedObject.id, { distance: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                     <hr className="light-props-separator" />
                     <div className="light-props-row">
                        <label className="light-props-label light-props-label-column">Decay:</label>
                        <div className="light-props-input-column">
                            <input
                                type="number"
                                className="light-props-input"
                                value={selectedObject.decay}
                                onChange={(e) => updateObject(selectedObject.id, { decay: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </>
            )}
            {/* Add other light-type specific properties here as needed */}
        </div>
    );
};

export default LightProperties;