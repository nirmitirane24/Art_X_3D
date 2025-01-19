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
                <h5>Emissive Color</h5>
                <input
                    type="color"
                    value={material.emissive || '#000000'}
                    onChange={(e) => handleMaterialChange('emissive', e.target.value)}
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
                <h5>Opacity</h5>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={material.opacity === undefined ? 1 : material.opacity}
                    onChange={(e) => handleMaterialChange('opacity', parseFloat(e.target.value))}
                />
            </div>
             <div>
                <h5>Reflectivity</h5>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={material.reflectivity === undefined ? 0 : material.reflectivity}
                    onChange={(e) => handleMaterialChange('reflectivity', parseFloat(e.target.value))}
                />
            </div>
             <div>
                <h5>Shininess</h5>
                 <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                     value={material.shininess === undefined ? 30 : material.shininess}
                     onChange={(e) => handleMaterialChange('shininess', parseFloat(e.target.value))}
                />
            </div>
            <div>
                <h5>IOR</h5>
                <input
                    type="number"
                    min="1"
                    max="2.5"
                     step="0.01"
                    value={material.ior === undefined ? 1.5 : material.ior}
                    onChange={(e) => handleMaterialChange('ior', parseFloat(e.target.value))}
                />
            </div>
              <div>
                 <h5>Transmission</h5>
                 <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                     value={material.transmission === undefined ? 0 : material.transmission}
                     onChange={(e) => handleMaterialChange('transmission', parseFloat(e.target.value))}
                 />
             </div>
            <div>
                <h5>Clearcoat</h5>
                  <input
                     type="range"
                    min="0"
                     max="1"
                    step="0.01"
                      value={material.clearcoat === undefined ? 0 : material.clearcoat}
                    onChange={(e) => handleMaterialChange('clearcoat', parseFloat(e.target.value))}
                   />
            </div>
            <div>
                <h5>Clearcoat Roughness</h5>
                 <input
                    type="range"
                     min="0"
                    max="1"
                    step="0.01"
                    value={material.clearcoatRoughness === undefined ? 0 : material.clearcoatRoughness}
                     onChange={(e) => handleMaterialChange('clearcoatRoughness', parseFloat(e.target.value))}
                 />
            </div>
            <div>
               <h5>Sheen</h5>
                <input
                    type="range"
                   min="0"
                   max="1"
                    step="0.01"
                    value={material.sheen === undefined ? 0 : material.sheen}
                    onChange={(e) => handleMaterialChange('sheen', parseFloat(e.target.value))}
                />
            </div>
             <div>
               <h5>Sheen Roughness</h5>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                     value={material.sheenRoughness === undefined ? 0 : material.sheenRoughness}
                    onChange={(e) => handleMaterialChange('sheenRoughness', parseFloat(e.target.value))}
                />
            </div>
             <div>
               <h5>Thickness</h5>
                <input
                   type="number"
                   min="0"
                   step="0.01"
                     value={material.thickness === undefined ? 0 : material.thickness}
                    onChange={(e) => handleMaterialChange('thickness', parseFloat(e.target.value))}
                />
            </div>
           <div>
                <h5>Side</h5>
                 <select
                    value={material.side || 'front'}
                    onChange={(e) => handleMaterialChange('side', e.target.value)}
                    >
                        <option value="front">Front</option>
                        <option value="back">Back</option>
                        <option value="double">Double</option>
                   </select>
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
                <h5>Normal Map</h5>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMaterialChange('normalMap', e.target.files[0])}
                />
            </div>
        </div>
    );
};

export default MaterialEditor;