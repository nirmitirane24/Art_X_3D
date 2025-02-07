// --- START OF FILE MaterialEditor.jsx ---
//No changes needed
import React, { useState, useRef, useEffect } from 'react';
import './materialEditor.css';
import { SketchPicker } from 'react-color';

const MaterialEditor = ({ material, onChange, onClose }) => {
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [emissivePickerOpen, setEmissivePickerOpen] = useState(false);
    const [selectedColorType, setSelectedColorType] = useState('color');
    const colorPickerRef = useRef(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const colorId = useRef(Date.now() + Math.random())
    const emissiveId = useRef(Date.now() + Math.random())

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
                setColorPickerOpen(false);
                setEmissivePickerOpen(false)
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [colorPickerRef]);


    const handleMaterialChange = (propName, value) => {
        onChange({ [propName]: value });
    };

    const handleColorChange = (color) => {
        handleMaterialChange(selectedColorType, color.hex);
    };

    const handleColorPickerToggle = (colorType) => {
        setSelectedColorType(colorType);
        if (colorType === 'color') {
            setColorPickerOpen(!colorPickerOpen)
            setEmissivePickerOpen(false)
        }
        else {
            setEmissivePickerOpen(!emissivePickerOpen)
            setColorPickerOpen(false)
        }
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
                <div className="color-picker-container">
                    <div
                        className="color-preview"
                        style={{ backgroundColor: material.color || '#ffffff' }}
                        onClick={() => handleColorPickerToggle('color')}
                    />
                    {colorPickerOpen && (
                        <div className="color-picker-popout" ref={colorPickerRef}>
                            <SketchPicker
                                color={material.color || '#ffffff'}
                                onChange={handleColorChange}
                                disableAlpha={true}
                                presetColors={[]}
                                id={colorId.current}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div>
                <h5>Emissive Color</h5>
                <div className="color-picker-container">
                    <div
                        className="color-preview"
                        style={{ backgroundColor: material.emissive || '#000000' }}
                        onClick={() => handleColorPickerToggle('emissive')}
                    />
                    {emissivePickerOpen && (
                        <div className="color-picker-popout" ref={colorPickerRef}>
                            <SketchPicker
                                color={material.emissive || '#000000'}
                                onChange={handleColorChange}
                                disableAlpha={true}
                                presetColors={[]}
                                id={emissiveId.current}
                            />
                        </div>
                    )}
                </div>
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
<br></br>
            <div>
                <button className='advanced-button' onClick={() => setShowAdvanced(!showAdvanced)}>
                    Advanced Properties {showAdvanced ? '▲' : '▼ '}
                </button>
            </div>

            {showAdvanced && (
                <div className="advanced-properties">

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
                        <h5>IOR</h5>
                        <input
                            id="number-input-materialeditor"
                            type="number"
                            min="1"
                            max="2.5"
                            step="0.01"
                            value={material.ior === undefined ? 1.5 : material.ior}
                            onChange={(e) => handleMaterialChange('ior', parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <h5>Thickness</h5>
                        <input
                            id="number-input-materialeditor"
                            type="number"
                            min="0"
                            step="0.01"
                            value={material.thickness === undefined ? 0 : material.thickness}
                            onChange={(e) => handleMaterialChange('thickness', parseFloat(e.target.value))}
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
                        <h5>Normal Map</h5>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMaterialChange('normalMap', e.target.files[0])}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialEditor;