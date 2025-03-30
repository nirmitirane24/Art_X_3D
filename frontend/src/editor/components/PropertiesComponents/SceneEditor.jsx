import React, { useState, useRef, useEffect } from 'react';
import './SceneEditor.css';
import { SketchPicker } from 'react-color';
import LightProperties from '../PropertiesComponents/LightProperties'; // Import LightProperties

const SceneEditor = ({ sceneSettings, updateObject, sceneObjects, selectedObjects }) => {
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
    const [lightColorPickerOpen, setLightColorPickerOpen] = useState(false);  // For the *scene* light
    const [lightColor, setLightColor] = useState(sceneSettings.lightColor || '#ffffff'); // For the *scene* light
    const [lightIntensity, setLightIntensity] = useState(sceneSettings.lightIntensity || 0);// For the *scene* light
    const [lightX, setLightX] = useState(sceneSettings.lightX || 0);       // For the *scene* light
    const [lightY, setLightY] = useState(sceneSettings.lightY || 0);       // For the *scene* light
    const [lightZ, setLightZ] = useState(sceneSettings.lightZ || 0);       // For the *scene* light
    const [lightShadows, setLightShadows] = useState(sceneSettings.lightShadows || false);  // For the *scene* light

    // Shadow Camera Controls
    const [shadowMapSize, setShadowMapSize] = useState(sceneSettings.shadowMapSize || 1024);
    const [shadowCameraNear, setShadowCameraNear] = useState(sceneSettings.shadowCameraNear || 0.1);
    const [shadowCameraFar, setShadowCameraFar] = useState(sceneSettings.shadowCameraFar || 50);
    const [shadowCameraLeft, setShadowCameraLeft] = useState(sceneSettings.shadowCameraLeft || -10);
    const [shadowCameraRight, setShadowCameraRight] = useState(sceneSettings.shadowCameraRight || 10);
    const [shadowCameraTop, setShadowCameraTop] = useState(sceneSettings.shadowCameraTop || 10);
    const [shadowCameraBottom, setShadowCameraBottom] = useState(sceneSettings.shadowCameraBottom || -10);

     // --- Selected Light Dropdown State ---
     const [selectedLightId, setSelectedLightId] = useState(null);

     // Get currently selected object from EditorManager (via props)
    const selectedObject =
        selectedObjects.length === 1
            ? sceneObjects.find((obj) => obj.id === selectedObjects[0])
            : null;


    const bgColorPickerRef = useRef(null);
    const fogColorPickerRef = useRef(null);
    const lightColorPickerRef = useRef(null); // Ref for the *scene* light color picker
    const bgColorId = useRef(Date.now() + Math.random());
    const fogColorId = useRef(Date.now() + Math.random());
    const lightColorId = useRef(Date.now() + Math.random()); // Unique ID for scene light picker

    // --- DROPDOWN HANDLER ---
    const handleLightSelect = (event) => {
            setSelectedLightId(Number(event.target.value));  // Keep as number
    };

     // Filter for light objects
    const lightObjects = sceneObjects.filter(obj =>
        obj.type === 'pointLight' || obj.type === 'spotLight' || obj.type === 'directionalLight'
    );
      // Find selected light using the dropdown's ID.
    const selectedLight = lightObjects.find(light => light.id === selectedLightId);

     // Determine the active object (either from Hierarchy or dropdown)
    const activeObject = selectedObject || selectedLight;

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
        setLightIntensity(sceneSettings.lightIntensity);
        setLightX(sceneSettings.lightX || 0);
        setLightY(sceneSettings.lightY || 0);
        setLightZ(sceneSettings.lightZ || 0);
        setLightShadows(sceneSettings.lightShadows || false);

        setShadowMapSize(sceneSettings.shadowMapSize || 1024);
        setShadowCameraNear(sceneSettings.shadowCameraNear || 0.1);
        setShadowCameraFar(sceneSettings.shadowCameraFar || 50);
        setShadowCameraLeft(sceneSettings.shadowCameraLeft || -10);
        setShadowCameraRight(sceneSettings.shadowCameraRight || 10);
        setShadowCameraTop(sceneSettings.shadowCameraTop || 10);
        setShadowCameraBottom(sceneSettings.shadowCameraBottom || -10);

    }, [sceneSettings]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check each picker individually and close if click is outside
            if (bgColorPickerOpen && bgColorPickerRef.current && !bgColorPickerRef.current.contains(event.target)) {
                setBgColorPickerOpen(false);
            }
            if (fogColorPickerOpen && fogColorPickerRef.current && !fogColorPickerRef.current.contains(event.target)) {
                setFogColorPickerOpen(false);
            }
            if (lightColorPickerOpen && lightColorPickerRef.current && !lightColorPickerRef.current.contains(event.target)) {
                setLightColorPickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [bgColorPickerOpen, fogColorPickerOpen, lightColorPickerOpen, bgColorPickerRef, fogColorPickerRef, lightColorPickerRef]); // Added open states to dependency array

    const handleBgColorChangeComplete = (color) => {
        setBgColor(color.hex);
        updateObject('scene', { backgroundColor: color.hex });
        setBgColorPickerOpen(false); // Close picker after color is chosen
    };

    const handleBgColorToggle = () => {
        setBgColorPickerOpen(!bgColorPickerOpen);
        setFogColorPickerOpen(false); // Close other pickers
        setLightColorPickerOpen(false);
    };

    const handleFogColorChangeComplete = (color) => {
        setFogColor(color.hex);
        updateObject('scene', { fogColor: color.hex });
        setFogColorPickerOpen(false); // Close picker after color is chosen
    };

    const handleFogColorToggle = () => {
        setFogColorPickerOpen(!fogColorPickerOpen);
        setBgColorPickerOpen(false); // Close other pickers
        setLightColorPickerOpen(false);
    };

     // --- Handlers for the *scene* light ---
     const handleLightColorChangeComplete = (color) => {
        setLightColor(color.hex);
        updateObject('scene', { lightColor: color.hex });
        setLightColorPickerOpen(false); // Close after selection
    };

    const handleLightColorToggle = () => {
        setLightColorPickerOpen(!lightColorPickerOpen);
        setBgColorPickerOpen(false);  // Close other pickers
        setFogColorPickerOpen(false);
    };

    const handleLightIntensityChange = (event) => {
        const value = parseFloat(event.target.value);
        setLightIntensity(value);
        updateObject('scene', { lightIntensity: value });
    };

    const handleLightXChange = (event) => {
        const value = parseFloat(event.target.value);
        setLightX(value);
        updateObject('scene', { lightX: value });
    };
    const handleLightYChange = (event) => {
        const value = parseFloat(event.target.value);
        setLightY(value);
        updateObject('scene', { lightY: value });
    };
    const handleLightZChange = (event) => {
        const value = parseFloat(event.target.value);
        setLightZ(value);
        updateObject('scene', { lightZ: value });
    };
     const handleLightShadowsChange = (event) => {
        setLightShadows(event.target.checked);
        updateObject('scene', { lightShadows: event.target.checked });
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
    // const handleLightIntensityChange = (event) => { //dupliacte function remvoing it
    //     setLightIntensity(parseFloat(event.target.value));
    //     updateObject('scene', { lightIntensity: parseFloat(event.target.value) });
    // };
    // const handleLightXChange = (event) => {
    //     setLightX(parseFloat(event.target.value));
    //     updateObject('scene', { lightX: parseFloat(event.target.value) });
    // };
    // const handleLightYChange = (event) => {
    //     setLightY(parseFloat(event.target.value));
    //     updateObject('scene', { lightY: parseFloat(event.target.value) });
    // };
    // const handleLightZChange = (event) => {
    //     setLightZ(parseFloat(event.target.value));
    //     updateObject('scene', { lightZ: parseFloat(event.target.value) });
    // };
    // const handleLightShadowsChange = (event) => {
    //     setLightShadows(event.target.checked);
    //     updateObject('scene', { lightShadows: event.target.checked });
    // };

    const handleShadowMapSizeChange = (event) => {
        const value = parseInt(event.target.value, 10);
        setShadowMapSize(value);
        updateObject('scene', { shadowMapSize: value });
    };

    const handleShadowCameraNearChange = (event) => {
        const value = parseFloat(event.target.value);
        setShadowCameraNear(value);
        updateObject('scene', { shadowCameraNear: value });
    };

    const handleShadowCameraFarChange = (event) => {
        const value = parseFloat(event.target.value);
        setShadowCameraFar(value);
        updateObject('scene', { shadowCameraFar: value });
    };

    const handleShadowCameraLeftChange = (event) => {
        const value = parseFloat(event.target.value);
        setShadowCameraLeft(value);
        updateObject('scene', { shadowCameraLeft: value });
    };

    const handleShadowCameraRightChange = (event) => {
        const value = parseFloat(event.target.value);
        setShadowCameraRight(value);
        updateObject('scene', { shadowCameraRight: value });
    };

    const handleShadowCameraTopChange = (event) => {
        const value = parseFloat(event.target.value);
        setShadowCameraTop(value);
        updateObject('scene', { shadowCameraTop: value });
    };

    const handleShadowCameraBottomChange = (event) => {
        const value = parseFloat(event.target.value);
        setShadowCameraBottom(value);
        updateObject('scene', { shadowCameraBottom: value });
    };

    return (
        <div className="scene-editor">
            <h3>Scene</h3>
            <hr className="style-six" ></hr>
            <div className="bg-color-container">
                <h4>Background Color</h4>
                <div className="color-picker-container">
                    <div
                        className="color-preview"
                        style={{ backgroundColor: bgColor }}
                        onClick={() => handleBgColorToggle()}
                    />
                </div>
                <div className={`color-picker-inline ${bgColorPickerOpen ? 'open' : ''}`} ref={bgColorPickerRef}>
                    {bgColorPickerOpen && (
                        <SketchPicker
                            color={bgColor}
                            onChangeComplete={handleBgColorChangeComplete} // Use onChangeComplete to close after selection
                            disableAlpha={true}
                            presetColors={[]}
                            id={bgColorId.current}
                        />
                    )}
                </div>
            </div>
            <hr className="style-six" ></hr>
            {/* --- Original Scene Light Controls --- */}
            <div className="light-section">
                <h4>Light</h4>
                <label className="switch" style={{ marginLeft: '117px', marginTop: '-16px' }}>
                    <input type="checkbox" checked={lightShadows} onChange={handleLightShadowsChange} />
                    <span className="slider round"></span>
                </label>
                {lightShadows && (
                    <>
                        <div className="light-container">
                            <div className="light-color-container">
                                <div
                                    className="color-preview"
                                    style={{ backgroundColor: lightColor }}
                                    onClick={handleLightColorToggle}
                                />
                            </div>
                            <div className={`color-picker-inline ${lightColorPickerOpen ? 'open' : ''}`} ref={lightColorPickerRef} style={{ marginTop: '-11px' }}>
                                {lightColorPickerOpen && (
                                    <SketchPicker
                                        color={lightColor}
                                        onChangeComplete={handleLightColorChangeComplete}
                                        disableAlpha={true}
                                        presetColors={[]}
                                        id={lightColorId.current}
                                    />
                                )}
                            </div>
                            <label style={{ marginLeft: '-93px' }}>
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
                    </>
                )}
            </div>
            <hr className="style-six" ></hr>
            {/* Shadow Controls */}
            <div className="shadow-controls-section">
                <label >
                <h4>Shadow</h4>Map Size
                    <select value={shadowMapSize} onChange={handleShadowMapSizeChange}>
                        <option value={512}>512</option>
                        <option value={1024}>1024</option>
                        <option value={2048}>2048</option>
                        <option value={4096}>4096</option>
                    </select>
                </label>
            </div>

            <hr className="style-six" ></hr>

            <div>
                <h4>Ambient shadows</h4>
                <label className="switch" style={{  marginLeft: '10px', marginTop: '10px' }}>
                    <input type="checkbox" checked={ambientShadowsEnabled} onChange={handleAmbientShadowsChange} />
                    <span className="slider round"></span>
                </label>
                {ambientShadowsEnabled && (
                    <><input
                        type="number"
                        className="ambient-input"
                        placeholder="Intensity"
                        value={ambientIntensity}
                        onChange={handleAmbientIntensityChange}
                    /></>
                )}
            </div>
        </div>
    );
};

export default SceneEditor;