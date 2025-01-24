import React, { useState } from 'react';
import '../styles/toolbar.css';
import ShapeButton from './toolbar/ShapeButton';

const basicShapes = ['cube', 'sphere']; // Basic shapes always visible
const advancedShapes = [
    'cylinder',
    'cone',
    'torus',
    'plane',
    'ring',
    'dodecahedron',
    'tetrahedron',
    'octahedron',
    'icosahedron',
    'capsule',
    'lathe',
    'polyhedron',
];

const Toolbar = ({ onAddModel, selectedObjects, onUndo, onRedo, undoDisabled, redoDisabled }) => {
    const [showShapes, setShowShapes] = useState(false);

    const toggleShapes = () => {
        setShowShapes(!showShapes);
    };

    return (
        <div className="toolbar">
            <div className="undo-redo-buttons">
                <button onClick={onUndo} disabled={undoDisabled} className="toolbar-button">
                    Undo
                </button>
                <button onClick={onRedo} disabled={redoDisabled} className="toolbar-button">
                    Redo
                </button>
            </div>
            <hr className='vertical-line'></hr>

            {/* Edit Mode Button with Conditional Styling */}
            {selectedObjects.length > 0 ? (
                <button className="edit-mode-button enabled">Edit Mode</button>
            ) : (
                <button className="edit-mode-button disabled">Edit Mode</button>
            )}
            <hr className='vertical-line'></hr>
            {/* Basic shapes always visible */}
            <div className="basic-shapes">
                {basicShapes.map((shape) => (
                    <ShapeButton key={shape} shape={shape} onAddModel={onAddModel} />
                ))}
            </div>

            <hr className='vertical-line'></hr>

            {/* Section for toggling advanced shapes */}
            <div className="toolbar-section" onClick={toggleShapes}>
                <span className="toolbar-section-title">
                    {showShapes ? '▾' : '▸'} More Shapes
                </span>
                {showShapes && (
                    <div className="advanced-shape-buttons">
                        <div className="advanced-shapes-scroll">
                            {advancedShapes.map((shape) => (
                                <ShapeButton
                                    key={shape}
                                    shape={shape}
                                    onAddModel={onAddModel}
                                    isAdvancedShape={true}  // Pass the flag for advanced shapes
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Toolbar;
