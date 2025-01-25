import React, { useState, useRef, useEffect } from 'react';
import './sceneEditor.css'; // Import the new CSS file
import { SketchPicker } from 'react-color';

const SceneEditor = ({ sceneObjects, updateObject }) => {
    const [bgColorPickerOpen, setBgColorPickerOpen] = useState(false);
    const [bgColor, setBgColor] = useState('#000000');
    const bgColorPickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bgColorPickerRef.current && !bgColorPickerRef.current.contains(event.target)) {
                setBgColorPickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [bgColorPickerRef]);

    const handleBgColorChange = (color) => {
        setBgColor(color.hex);
        updateObject('scene', { backgroundColor: color.hex }); // assuming 'scene' is the id for scene object
    };

    const handleBgColorToggle = () => {
        setBgColorPickerOpen(!bgColorPickerOpen);
    };

    return (
        <div className="scene-editor">
            <div className="bg-color-container">
                <h3>Scene</h3>
                <h4>BG Color</h4>
                <div className="color-picker-container">
                    <div
                        className="color-preview"
                        style={{ backgroundColor: bgColor }}
                        onClick={() => handleBgColorToggle()}
                    />
                    {bgColorPickerOpen && (
                        <div className="color-picker-popout" ref={bgColorPickerRef}>
                            <SketchPicker
                                color={bgColor}
                                onChange={handleBgColorChange}
                                disableAlpha={true}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div>
                <h4>Play Camera</h4>
                <select>
                    <option value="default">Personal...</option>
                </select>
            </div>
            <div>
                <h4>Light <span className="arrow-icon">></span></h4>
            </div>
            <div>
                <h4>Simulation <span className="arrow-icon">></span></h4>
            </div>
            <div>
                <h4>Effects</h4>
                <label className="switch">
                    <input type="checkbox" />
                    <span className="slider round"></span>
                </label>
            </div>
            <div>
                <h4>Fog</h4>
                <label className="switch">
                    <input type="checkbox" />
                    <span className="slider round"></span>
                </label>
            </div>
            <div>
                <h4>Ambient Shadows</h4>
                <label className="switch">
                    <input type="checkbox" />
                    <span className="slider round"></span>
                </label>
            </div>
        </div>
    );
};

export default SceneEditor;