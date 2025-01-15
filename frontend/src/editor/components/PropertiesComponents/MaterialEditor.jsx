import React from 'react';
import './materialEditor.css';

const MaterialEditor = ({ material, onChange, onClose }) => {
    const handleMaterialChange = (propName, value) => {
        onChange({ [propName]: value });
    };

    return (
         <div className="material-editor">
             <div className="material-editor-header">
                 <h4>Material Editor</h4>
                <button className="material-editor-close-button" onClick={onClose}>
                     x
                 </button>
             </div>
            <div>
                <h5>Color</h5>
                <input
                    type="color"
                    value={material.color || '#ffffff'}
                    onChange={(e) => handleMaterialChange('color', e.target.value)}
                />
            </div>
            <div>
                <h5>Metalness</h5>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={material.metalness || 0}
                    onChange={(e) => handleMaterialChange('metalness', parseFloat(e.target.value))}
                />
            </div>
            <div>
                <h5>Roughness</h5>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={material.roughness || 0.5}
                    onChange={(e) => handleMaterialChange('roughness', parseFloat(e.target.value))}
                />
            </div>
            <div>
                <h5>Texture</h5>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMaterialChange('texture', e.target.files[0])}
                />
            </div>
            <div>
                <h5>Miscellaneous</h5>
                <input
                    type="number"
                    placeholder="Custom property"
                    onChange={(e) => handleMaterialChange('custom', parseFloat(e.target.value))}
                />
            </div>
        </div>
    );
};

export default MaterialEditor;