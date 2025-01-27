import React, { useState, useRef, useEffect } from 'react';
import '../styles/propertiesPanel.css';
import MaterialEditor from './PropertiesComponents/MaterialEditor';
import SceneEditor from './PropertiesComponents/SceneEditor';

const PropertiesPanel = ({ selectedObjects, sceneObjects, updateObject }) => {
    const [isMaterialEditorOpen, setMaterialEditorOpen] = useState(false);
    const [dragging, setDragging] = useState({ prop: null, axis: null, startX: 0, startValue: 0 });
    const [inputValue, setInputValue] = useState({});
    const materialEditorButtonRef = useRef(null);


    const selectedObject = selectedObjects.length === 1
        ? sceneObjects.find((obj) => obj.id === selectedObjects[0])
        : null;

    const handlePropertyChange = (propName, value) => {
        if (selectedObject) {
            updateObject(selectedObject.id, { [propName]: value });
        }
    };


    const handleInputChange = (event, prop, axis) => {
        const value = parseFloat(event.target.value);
        if (!isNaN(value)) {
            const updatedValue = selectedObject[prop].map((val, index) =>
                index === axis ? value : val
            );
            handlePropertyChange(prop, updatedValue);
            setInputValue((prev) => ({
                ...prev,
                [`${prop}-${axis}`]: value,
            }));
        }
    };


    const startDrag = (event, prop, axis, startValue) => {
        setDragging({ prop, axis, startX: event.clientX, startValue });
    };


    const handleDrag = (event) => {
        if (!dragging.prop) return;

        const deltaX = event.clientX - dragging.startX;
        const sensitivity = 0.05;
        let newValue = dragging.startValue + (deltaX * sensitivity);

        if (dragging.prop === 'position' || dragging.prop === 'rotation' || dragging.prop === 'scale') {
            const updatedValues = selectedObject[dragging.prop].map((val, index) =>
                index === dragging.axis ? newValue : val
            );
            handlePropertyChange(dragging.prop, updatedValues);
            setInputValue((prev) => ({
                ...prev,
                [`${dragging.prop}-${dragging.axis}`]: newValue,
            }));
        }
    };

    const endDrag = () => {
        setDragging({ prop: null, axis: null, startX: 0, startValue: 0 });
    };

    useEffect(() => {
        if (dragging.prop) {
            window.addEventListener('mousemove', handleDrag);
            window.addEventListener('mouseup', endDrag);
        }
        return () => {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', endDrag);
        };
    }, [dragging]);


    const handleMaterialChange = (newMaterial) => {
        if (selectedObject) {
            updateObject(selectedObject.id, {
                material: { ...selectedObject.material, ...newMaterial },
            });
        }
    };

    const toggleMaterialEditor = () => {
        setMaterialEditorOpen(!isMaterialEditorOpen);
    };


    if (!selectedObject) {
        return (
            <div className="properties-panel">
                <h3>Properties</h3>
                  <SceneEditor sceneObjects={sceneObjects} updateObject={updateObject} />
                
            </div>
        );
    }

    return (
        <>
            <div className="properties-panel">
                <h3>Properties</h3>
                <div>
                    <h4>Selected : {selectedObject.type} </h4>
                </div>
                <div className="slider-group">
                    <div className="slider-row">
                        <h4>Position</h4>
                        {selectedObject.position.map((value, index) => (
                            <div key={`position-${index}`} className="slider-input-group">
                                <div
                                    className="horizontal-slider"
                                    onMouseDown={(e) => startDrag(e, 'position', index, value)}
                                >
                                    <div className="slider-thumb" style={{ left: `${(value * 20)}px` }}></div>
                                </div>
                                <input
                                    type="text"
                                    className="number-input"
                                    value={inputValue[`position-${index}`] === undefined ? value : inputValue[`position-${index}`]}
                                    onChange={(e) => handleInputChange(e, 'position', index)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="slider-group">
                    <div className="slider-row">
                        <h4>Rotation</h4>
                        {selectedObject.rotation.map((value, index) => (
                            <div key={`rotation-${index}`} className="slider-input-group">
                                <div
                                    className="horizontal-slider"
                                    onMouseDown={(e) => startDrag(e, 'rotation', index, value)}
                                >
                                    <div className="slider-thumb" style={{ left: `${(value * 20)}px` }}></div>
                                </div>
                                <input
                                    type="text"
                                    className="number-input"
                                    value={inputValue[`rotation-${index}`] === undefined ? value : inputValue[`rotation-${index}`]}
                                    onChange={(e) => handleInputChange(e, 'rotation', index)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="slider-group">
                    <div className="slider-row">
                        <h4>Scale</h4>
                        {selectedObject.scale.map((value, index) => (
                            <div key={`scale-${index}`} className="slider-input-group">
                                <div
                                    className="horizontal-slider"
                                    onMouseDown={(e) => startDrag(e, 'scale', index, value)}
                                >
                                    <div className="slider-thumb" style={{ left: `${(value * 20)}px` }}></div>
                                </div>
                                <input
                                    type="text"
                                    className="number-input"
                                    value={inputValue[`scale-${index}`] === undefined ? value : inputValue[`scale-${index}`]}
                                    onChange={(e) => handleInputChange(e, 'scale', index)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <button
                        className="material-editor-button"
                        onClick={toggleMaterialEditor}
                        ref={materialEditorButtonRef}
                    >
                        {isMaterialEditorOpen ? '- Material Editor' : '+ Material Editor'}
                    </button>

                </div>
            </div>
            {isMaterialEditorOpen && (
                <div className="material-editor-popout" style={{
                    position: 'absolute',
                    left: materialEditorButtonRef.current ? materialEditorButtonRef.current.offsetLeft - 310 : 0,
                    top: materialEditorButtonRef.current ? materialEditorButtonRef.current.offsetTop : 0,

                }}>
                    <MaterialEditor
                        material={selectedObject.material}
                        onChange={handleMaterialChange}
                        onClose={toggleMaterialEditor}
                    />
                </div>
            )}
        </>
    );
};

export default PropertiesPanel;