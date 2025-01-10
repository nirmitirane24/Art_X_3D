// src/components/toolbar/ShapeButton.jsx
import React from 'react';

const shapeIcons = {
    cube: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="20" width="60" height="60" fill="none" stroke="black" strokeWidth="2"/>
            <line x1="20" y1="20" x2="50" y2="10" stroke="black" strokeWidth="2" />
            <line x1="80" y1="20" x2="50" y2="10" stroke="black" strokeWidth="2" />
            <line x1="80" y1="80" x2="50" y2="90" stroke="black" strokeWidth="2" />
            <line x1="20" y1="80" x2="50" y2="90" stroke="black" strokeWidth="2" />
        </svg>
    ),
    sphere: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="30" fill="none" stroke="black" strokeWidth="2"/>
            <ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="black" strokeWidth="2"/>
            <ellipse cx="50" cy="50" rx="10" ry="30" fill="none" stroke="black" strokeWidth="2"/>
        </svg>
    ),
    cylinder: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="25" rx="30" ry="10" fill="none" stroke="black" strokeWidth="2"/>
            <rect x="20" y="25" width="60" height="50" fill="none" stroke="black" strokeWidth="2"/>
            <ellipse cx="50" cy="75" rx="30" ry="10" fill="none" stroke="black" strokeWidth="2"/>
        </svg>
    ),
    cone: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="75" rx="30" ry="10" fill="none" stroke="black" strokeWidth="2"/>
            <line x1="20" y1="75" x2="50" y2="25" stroke="black" strokeWidth="2"/>
            <line x1="80" y1="75" x2="50" y2="25" stroke="black" strokeWidth="2"/>
        </svg>
    ),
    torus: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="30" fill="none" stroke="black" strokeWidth="2"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="black" strokeWidth="2"/>
        </svg>
    ),
    plane: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="40" width="60" height="20" fill="none" stroke="black" strokeWidth="2"/>
        </svg>
    ),
    ring: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="30" fill="none" stroke="black" strokeWidth="2"/>
            <circle cx="50" cy="50" r="10" fill="none" stroke="black" strokeWidth="2"/>
        </svg>
    ),
    dodecahedron: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <polygon points="30,30 70,30 80,50 50,70 20,50" fill="none" stroke="black" strokeWidth="2"/>
        </svg>
    ),
    tetrahedron: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,10 80,80 20,80" fill="none" stroke="black" strokeWidth="2"/>
        </svg>
    ),
    octahedron: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,20 80,50 50,80 20,50" fill="none" stroke="black" strokeWidth="2"/>
        </svg>
    ),
    icosahedron: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,10 80,40 50,70 20,40" fill="none" stroke="black" strokeWidth="2"/>
        </svg>
    ),
    capsule: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="30" width="40" height="40" fill="none" stroke="black" strokeWidth="2" rx="20" ry="20"/>
        </svg>
    ),
    lathe: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M 50,20 Q 70,50 50,80 Q 30,50 50,20" fill="none" stroke="black" strokeWidth="2"/>
        </svg>
    ),
    polyhedron: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <polygon points="30,30 70,30 70,70 30,70" fill="none" stroke="black" strokeWidth="2"/>
        </svg>
    ),
};

const ShapeButton = ({ shape, onAddModel }) => {
    const handleClick = () => {
        onAddModel(shape);
    };

    return (
        <button onClick={handleClick} className="toolbar-button">
            {shapeIcons[shape]}
            <span>{shape.charAt(0).toUpperCase() + shape.slice(1)}</span>
        </button>
    );
};

export default ShapeButton;