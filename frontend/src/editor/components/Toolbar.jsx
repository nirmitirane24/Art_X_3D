// src/components/Toolbar.jsx
import React, { useState } from 'react';
import '../styles/toolbar.css';
import ShapeButton from './toolbar/ShapeButton';

const shapes = [
    'cube', 'sphere', 'cylinder', 'cone', 'torus', 'plane',
    'ring', 'dodecahedron', 'tetrahedron', 'octahedron',
    'icosahedron', 'capsule', 'lathe', 'polyhedron',
];

const Toolbar = ({ onAddModel }) => {
    const [showShapes, setShowShapes] = useState(false);

    const toggleShapes = () => {
        setShowShapes(!showShapes);
    };

    return (
        <div className="toolbar">
            <div className="toolbar-section" onClick={toggleShapes}>
                <span className="toolbar-section-title">
                    {showShapes ? '▿' : '+'} Add Shape
                </span>
                {showShapes && (
                    <div className="shape-buttons">
                        {shapes.map((shape) => (
                            <ShapeButton key={shape} shape={shape} onAddModel={onAddModel}/>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Toolbar;