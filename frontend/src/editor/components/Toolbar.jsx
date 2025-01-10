// src/components/Toolbar.jsx
import React from 'react';
import '../styles/toolbar.css'
import ShapeButton from './toolbar/ShapeButton.jsx';

const shapes = [
    'cube', 'sphere', 'cylinder', 'cone', 'torus', 'plane',
    'ring', 'dodecahedron', 'tetrahedron', 'octahedron',
    'icosahedron', 'capsule', 'lathe', 'polyhedron',
];

const Toolbar = ({ onAddModel }) => {
    return (
        <div className="toolbar">
            {shapes.map((shape) => (
                <ShapeButton key={shape} shape={shape} onAddModel={onAddModel} />
            ))}
        </div>
    );
};

export default Toolbar;