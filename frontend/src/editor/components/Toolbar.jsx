// src/components/Toolbar.jsx
import React, { useState } from 'react';
import '../styles/toolbar.css';
import ShapeButton from './toolbar/ShapeButton';

const basicShapes = ['cube', 'sphere']; // Basic shapes always visible
const advancedShapes = [
    'cylinder', 'cone', 'torus', 'plane',
    'ring', 'dodecahedron', 'tetrahedron', 'octahedron',
    'icosahedron', 'capsule', 'lathe', 'polyhedron',
];

const Toolbar = ({ onAddModel ,selectedObjects}) => {
    const [showShapes, setShowShapes] = useState(false);

    const toggleShapes = () => {
        setShowShapes(!showShapes);
    };

    return (
        <div className="toolbar">
            {/* enter edit mode */}
            {selectedObjects.length > 0 && (
                <button className="edit-mode-button">
                    Edit Mode
                </button>
            )}
            {/* Basic shapes always visible */}
            <div className="basic-shapes">
                {basicShapes.map((shape) => (
                    <ShapeButton key={shape} shape={shape} onAddModel={onAddModel} id="basic-shapes-btn"/>
                ))}
            </div>

            {/* Section for toggling advanced shapes */}
            <div className="toolbar-section" onClick={toggleShapes}>
                <span className="toolbar-section-title">
                    {showShapes ? '▾' : '▸'} More Shapes
                </span>
                {showShapes && (
                    <div className="advanced-shape-buttons">
                        {advancedShapes.map((shape) => (
                            <ShapeButton key={shape} shape={shape} onAddModel={onAddModel} />
                        ))}
                        
                    </div>
                )}
            </div>
        </div>
    );
};

export default Toolbar;