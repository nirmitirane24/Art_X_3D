// LightProperties.js
import React from "react";
import "./LightProperties.css";

const LightProperties = ({ selectedObject, updateObject, handleInputChange, startDrag, inputValue }) => {
    const handleTargetChange = (index, value) => {
        const newTarget = [...selectedObject.target];
        newTarget[index] = parseFloat(value);
        updateObject(selectedObject.id, { target: newTarget });
    };

    return (
        <div className="light-props-container" style={{ width: "90%" }}>
            <h4 className="light-props-header" >Light Properties</h4><br />

            <div className="light-props-row">
                <div className="light-props-label-column">
                    <label className="light-props-label">Color:</label>
                </div>
                <div className="light-props-input-column">
                    <input
                        type="color"
                        value={selectedObject.color}
                        onChange={(e) => updateObject(selectedObject.id, { color: e.target.value })}
                        className="light-props-color-input"
                    />
                </div>
            </div>
            
            <div className="light-props-row">
                <div className="light-props-label-column">
                    <label className="light-props-label">Intensity:</label>
                </div>
                <div className="light-props-input-column">
                    <input
                        type="number"
                        value={selectedObject.intensity}
                        onChange={(e) => updateObject(selectedObject.id, { intensity: parseFloat(e.target.value) })}
                        className="light-props-input"
                    />
                </div>
            </div>

            {selectedObject.type === "spotLight" && (
                <>
                    <div className="light-props-row">
                        <div className="light-props-label-column">
                            <label className="light-props-label">Angle (°):</label>
                        </div>
                        <div className="light-props-input-column">
                            <input
                                type="number"
                                value={((inputValue[`angle-null`] ?? selectedObject.angle) * 180 / Math.PI).toFixed(2)}
                                onChange={(e) => {
                                    const radianValue = parseFloat(e.target.value) * (Math.PI / 180);
                                    handleInputChange(e, "angle", null);
                                    updateObject(selectedObject.id, { angle: radianValue });
                                }}
                                className="light-props-angle-input"
                            />
                        </div>
                    </div>
                    <div className="light-props-row">
                        <div className="light-props-label-column">
                            <label className="light-props-label">Penumbra:</label>
                         </div>
                        <div className="light-props-input-column">
                            <input
                                type="number"
                                value={selectedObject.penumbra}
                                onChange={(e) => updateObject(selectedObject.id, { penumbra: parseFloat(e.target.value) })}
                                className="light-props-input"
                            />
                        </div>
                  </div>
                    <div className="light-props-row">
                        <div className="light-props-label-column">
                        <label className="light-props-label">Distance:</label>
                        </div>
                        <div className="light-props-input-column">
                            <input
                                type="number"
                                value={selectedObject.distance}
                                onChange={(e) => updateObject(selectedObject.id, { distance: parseFloat(e.target.value) })}
                                className="light-props-input"
                            />
                        </div>
                   </div>
                    <div className="light-props-row">
                        <div className="light-props-label-column">
                    <label className="light-props-label">Decay:</label>
                    </div>
                        <div className="light-props-input-column">
                            <input
                                type="number"
                                value={selectedObject.decay}
                                onChange={(e) => updateObject(selectedObject.id, { decay: parseFloat(e.target.value) })}
                                className="light-props-input"
                            />
                        </div>
                    </div>

                    <div className="light-props-row-xyz">
                        <div className="light-props-label-column">
                            <label className="light-props-label">Target:</label>
                        </div>
                        <div className="light-props-input-column-xyz">
                            {selectedObject.target?.map((value, index) => (
                                <input
                                    key={index}
                                    type="number"
                                    value={value}
                                    onChange={(e) => handleTargetChange(index, e.target.value)}
                                    className="light-props-input-small"
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {selectedObject.type === "directionalLight" && (
                 <div className="light-props-row-xyz">
                        <div className="light-props-label-column">
                            <label className="light-props-label">Target:</label>
                        </div>
                        <div className="light-props-input-column-xyz">
                            {selectedObject.target?.map((value, index) => (
                                <input
                                    key={index}
                                    type="number"
                                    value={value}
                                    onChange={(e) => handleTargetChange(index, e.target.value)}
                                    className="light-props-input-small"
                                />
                            ))}
                        </div>
                </div>
            )}
        </div>
    );
};

export default LightProperties;