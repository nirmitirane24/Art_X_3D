import React from 'react';
import '../styles/propertiesPanel.css'; // Import the CSS

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
            {/* Add more properties like rotation, scale, material, etc. */}
        </div>
    );
};

export default PropertiesPanel;