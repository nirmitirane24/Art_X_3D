import React from 'react';
import '../styles/propertiesPanel.css';

const PropertiesPanel = ({ selectedObjects, sceneObjects, updateObject }) => {
    const selectedObject = selectedObjects.length === 1
        ? sceneObjects.find((obj) => obj.id === selectedObjects[0])
        : null;

    const handlePropertyChange = (propName, value) => {
        if (selectedObject) {
            updateObject(selectedObject.id, { [propName]: value });
        }
    };

    if (!selectedObject) {
        return (
            <div className="properties-panel">
                <h3>Properties</h3>
                <p>No object selected</p>
            </div>
        );
    }

    return (
        <div className="properties-panel">
            <h3>Properties</h3>
            <div>
                <h4>Type</h4>
                <p>{selectedObject.type}</p>
            </div>
            <div>
                <h4>Position</h4>
                <input
                    type="number"
                    value={selectedObject.position[0]}
                    onChange={(e) => handlePropertyChange('position', [
                        parseFloat(e.target.value),
                        selectedObject.position[1],
                        selectedObject.position[2],
                    ])}
                />
                <input
                    type="number"
                    value={selectedObject.position[1]}
                    onChange={(e) => handlePropertyChange('position', [
                        selectedObject.position[0],
                        parseFloat(e.target.value),
                        selectedObject.position[2],
                    ])}
                />
                <input
                    type="number"
                    value={selectedObject.position[2]}
                    onChange={(e) => handlePropertyChange('position', [
                        selectedObject.position[0],
                        selectedObject.position[1],
                        parseFloat(e.target.value),
                    ])}
                />
            </div>
            <div>
                <h4>Rotation</h4>
                <input
                    type="number"
                    value={selectedObject.rotation[0]}
                    onChange={(e) => handlePropertyChange('rotation', [
                        parseFloat(e.target.value),
                        selectedObject.rotation[1],
                        selectedObject.rotation[2],
                    ])}
                />
                <input
                    type="number"
                    value={selectedObject.rotation[1]}
                    onChange={(e) => handlePropertyChange('rotation', [
                        selectedObject.rotation[0],
                        parseFloat(e.target.value),
                        selectedObject.rotation[2],
                    ])}
                />
                <input
                    type="number"
                    value={selectedObject.rotation[2]}
                    onChange={(e) => handlePropertyChange('rotation', [
                        selectedObject.rotation[0],
                        selectedObject.rotation[1],
                        parseFloat(e.target.value),
                    ])}
                />
            </div>
            <div>
                <h4>Scale</h4>
                <input
                    type="number"
                    value={selectedObject.scale[0]}
                    onChange={(e) => handlePropertyChange('scale', [
                        parseFloat(e.target.value),
                        selectedObject.scale[1],
                        selectedObject.scale[2],
                    ])}
                />
                <input
                    type="number"
                    value={selectedObject.scale[1]}
                    onChange={(e) => handlePropertyChange('scale', [
                        selectedObject.scale[0],
                        parseFloat(e.target.value),
                        selectedObject.scale[2],
                    ])}
                />
                <input
                    type="number"
                    value={selectedObject.scale[2]}
                    onChange={(e) => handlePropertyChange('scale', [
                        selectedObject.scale[0],
                        selectedObject.scale[1],
                        parseFloat(e.target.value),
                    ])}
                />
            </div>
        </div>
    );
};

export default PropertiesPanel;