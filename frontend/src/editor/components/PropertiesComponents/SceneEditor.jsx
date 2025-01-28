import React, { useState, useRef, useEffect } from 'react';
import './sceneEditor.css'; // Import the new CSS file
import { SketchPicker } from 'react-color';

const SceneEditor = ({ sceneSettings, updateObject }) => {
    const [bgColorPickerOpen, setBgColorPickerOpen] = useState(false);
    const [bgColor, setBgColor] = useState(sceneSettings.backgroundColor || '#000000');
    const [effectsEnabled, setEffectsEnabled] = useState(sceneSettings.effectsEnabled || false);
    const [fogEnabled, setFogEnabled] = useState(sceneSettings.fogEnabled || false);
    const [fogColorPickerOpen, setFogColorPickerOpen] = useState(false);
    const [fogColor, setFogColor] = useState(sceneSettings.fogColor || '#ffffff');
    const [fogNear, setFogNear] = useState(sceneSettings.fogNear || 1);
    const [fogFar, setFogFar] = useState(sceneSettings.fogFar || 100);
    const [ambientShadowsEnabled, setAmbientShadowsEnabled] = useState(sceneSettings.ambientShadowsEnabled || false);
    const [ambientIntensity, setAmbientIntensity] = useState(sceneSettings.ambientIntensity || 0);
    const [lightColorPickerOpen, setLightColorPickerOpen] = useState(false);
    const [lightColor, setLightColor] = useState(sceneSettings.lightColor || '#ffffff');
    const [lightIntensity, setLightIntensity] = useState(sceneSettings.lightIntensity || 50);
    const [lightX, setLightX] = useState(sceneSettings.lightX || 0);
    const [lightY, setLightY] = useState(sceneSettings.lightY || 0);
    const [lightZ, setLightZ] = useState(sceneSettings.lightZ || 0);
    const [lightShadows, setLightShadows] = useState(sceneSettings.lightShadows || false);



    const bgColorPickerRef = useRef(null);
    const fogColorPickerRef = useRef(null);
    const lightColorPickerRef = useRef(null);


    useEffect(() => {
        // Set local states with initial or updated values from sceneSettings
        setBgColor(sceneSettings.backgroundColor || '#000000');
        setEffectsEnabled(sceneSettings.effectsEnabled || false);
        setFogEnabled(sceneSettings.fogEnabled || false);
        setFogColor(sceneSettings.fogColor || '#ffffff');
        setFogNear(sceneSettings.fogNear || 1);
        setFogFar(sceneSettings.fogFar || 100);
         setAmbientShadowsEnabled(sceneSettings.ambientShadowsEnabled || false);
        setAmbientIntensity(sceneSettings.ambientIntensity || 0);
        setLightColor(sceneSettings.lightColor || '#ffffff');
        setLightIntensity(sceneSettings.lightIntensity || 50);
        setLightX(sceneSettings.lightX || 0);
        setLightY(sceneSettings.lightY || 0);
        setLightZ(sceneSettings.lightZ || 0);
        setLightShadows(sceneSettings.lightShadows || false);

    }, [sceneSettings]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if ((bgColorPickerRef.current && !bgColorPickerRef.current.contains(event.target)) && (fogColorPickerRef.current && !fogColorPickerRef.current.contains(event.target)) && (lightColorPickerRef.current && !lightColorPickerRef.current.contains(event.target))) {
                setBgColorPickerOpen(false);
                setFogColorPickerOpen(false);
                setLightColorPickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [bgColorPickerRef, fogColorPickerRef, lightColorPickerRef]);

    const handleBgColorChange = (color) => {
        setBgColor(color.hex);
        updateObject('scene', { backgroundColor: color.hex });
    };

    const handleBgColorToggle = () => {
        setBgColorPickerOpen(!bgColorPickerOpen);
    };

    const handleFogColorChange = (color) => {
        setFogColor(color.hex);
        updateObject('scene', { fogColor: color.hex });
    };

    const handleFogColorToggle = () => {
        setFogColorPickerOpen(!fogColorPickerOpen);
    };

    const handleLightColorChange = (color) => {
        setLightColor(color.hex);
        updateObject('scene', { lightColor: color.hex });
    };

    const handleLightColorToggle = () => {
        setLightColorPickerOpen(!lightColorPickerOpen);
    };


    const handleEffectsChange = (event) => {
        setEffectsEnabled(event.target.checked);
        updateObject('scene', { effectsEnabled: event.target.checked });
    };

    const handleFogChange = (event) => {
        setFogEnabled(event.target.checked);
        updateObject('scene', { fogEnabled: event.target.checked });
    };

    const handleAmbientShadowsChange = (event) => {
        setAmbientShadowsEnabled(event.target.checked);
        updateObject('scene', { ambientShadowsEnabled: event.target.checked });
    };

    const handleAmbientIntensityChange = (event) => {
        setAmbientIntensity(parseFloat(event.target.value));
        updateObject('scene', { ambientIntensity: parseFloat(event.target.value) });
    };

    const handleFogNearChange = (event) => {
        setFogNear(parseFloat(event.target.value));
        updateObject('scene', { fogNear: parseFloat(event.target.value) });
    };

    const handleFogFarChange = (event) => {
        setFogFar(parseFloat(event.target.value));
        updateObject('scene', { fogFar: parseFloat(event.target.value) });
    };
    const handleLightIntensityChange = (event) => {
        setLightIntensity(parseFloat(event.target.value));
        updateObject('scene', { lightIntensity: parseFloat(event.target.value) });
    };
    const handleLightXChange = (event) => {
        setLightX(parseFloat(event.target.value));
        updateObject('scene', { lightX: parseFloat(event.target.value) });
    };
    const handleLightYChange = (event) => {
        setLightY(parseFloat(event.target.value));
        updateObject('scene', { lightY: parseFloat(event.target.value) });
    };
    const handleLightZChange = (event) => {
        setLightZ(parseFloat(event.target.value));
        updateObject('scene', { lightZ: parseFloat(event.target.value) });
    };
    const handleLightShadowsChange = (event) => {
        setLightShadows(event.target.checked);
        updateObject('scene', { lightShadows: event.target.checked });
    };


    return (
        <div className="scene-editor">
            <h3>Scene</h3>
            <div className="bg-color-container">
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

            <div className="light-section">
                <h4>Light</h4>
                <label className="switch" style={{ marginLeft: '10px', marginTop: '-16px' }}>
                    <input type="checkbox" checked={lightShadows} onChange={handleLightShadowsChange} />
                    <span className="slider round"></span>
                </label>
                <div className="light-container">
                    <div className="light-color-container">
                        <div
                            className="color-preview"
                            style={{ backgroundColor: lightColor }}
                            onClick={() => handleLightColorToggle()}
                        />
                        {lightColorPickerOpen && (
                            <div className="color-picker-popout" ref={lightColorPickerRef}>
                                <SketchPicker
                                    color={lightColor}
                                    onChange={handleLightColorChange}
                                    disableAlpha={true}
                                />
                            </div>
                        )}
                    </div>
                    <label>
                        Intensity
                        <input
                            type="number"
                            className="light-input"
                            placeholder="Intensity"
                            value={lightIntensity}
                            onChange={handleLightIntensityChange}
                        />
                    </label>
                </div>
                <div className="light-container-position">
                    <label>
                        X
                        <input
                            type="number"
                            className="light-input"
                            placeholder="X"
                            value={lightX}
                            onChange={handleLightXChange}
                        />
                    </label>
                    <label>
                        Y
                        <input
                            type="number"
                            className="light-input"
                            placeholder="Y"
                            value={lightY}
                            onChange={handleLightYChange}
                        />
                    </label>
                    <label>
                        Z
                        <input
                            type="number"
                            className="light-input"
                            placeholder="Z"
                            value={lightZ}
                            onChange={handleLightZChange}
                        />
                    </label>
                </div>

            </div>



            <div>
                <h4>Effects</h4>
                <label className="switch">
                    <input type="checkbox" checked={effectsEnabled} onChange={handleEffectsChange} />
                    <span className="slider round"></span>
                </label>
            </div>

            <div>
                <h4>Ambient Shadows</h4>
                <label className="switch">
                    <input type="checkbox" checked={ambientShadowsEnabled} onChange={handleAmbientShadowsChange} />
                    <span className="slider round"></span>
                </label>
                <input
                    type="number"
                    className="ambient-input"
                    placeholder="Intensity"
                    value={ambientIntensity}
                    onChange={handleAmbientIntensityChange}
                />
            </div>
              <hr />
              
        </div>
    );
};

export default SceneEditor;