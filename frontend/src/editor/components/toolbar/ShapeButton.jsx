// src/components/toolbar/ShapeButton.jsx
import React from 'react';

const shapeIcons = {
    cube: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M21 16.0586V7.94153C21 7.59889 21 7.42757 20.9495 7.27477C20.9049 7.13959 20.8318 7.01551 20.7354 6.91082C20.6263 6.79248 20.4766 6.70928 20.177 6.54288L12.777 2.43177C12.4934 2.27421 12.3516 2.19543 12.2015 2.16454C12.0685 2.13721 11.9315 2.13721 11.7986 2.16454C11.6484 2.19543 11.5066 2.27421 11.223 2.43177L3.82297 6.54288C3.52345 6.70928 3.37369 6.79248 3.26463 6.91082C3.16816 7.01551 3.09515 7.13959 3.05048 7.27477C3 7.42757 3 7.59889 3 7.94153V16.0586C3 16.4013 3 16.5726 3.05048 16.7254C3.09515 16.8606 3.16816 16.9847 3.26463 17.0893C3.37369 17.2077 3.52345 17.2909 3.82297 17.4573L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L20.177 17.4573C20.4766 17.2909 20.6263 17.2077 20.7354 17.0893C20.8318 16.9847 20.9049 16.8606 20.9495 16.7254C21 16.5726 21 16.4013 21 16.0586Z" stroke="white" strokeWidth="1" strokeLinejoin="round" />
        </svg>
    ),
    sphere: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="4" />
            <ellipse cx="50" cy="50" rx="42" ry="10" fill="none" stroke="white" strokeWidth="4" />
            <ellipse cx="50" cy="50" rx="10" ry="42" fill="none" stroke="white" strokeWidth="4" />
        </svg>
    ),
    cylinder: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="25" rx="30" ry="12" fill="none" stroke="white" strokeWidth="4" />
            <ellipse cx="50" cy="75" rx="30" ry="12" fill="none" stroke="white" strokeWidth="4" />
            <line x1="20" y1="25" x2="20" y2="75" stroke="white" strokeWidth="4" />
            <line x1="80" y1="25" x2="80" y2="75" stroke="white" strokeWidth="4" />
        </svg>
    ),
    cone: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="75" rx="30" ry="10" fill="none" stroke="white" strokeWidth="4" />
            <line x1="20" y1="75" x2="50" y2="25" stroke="white" strokeWidth="4" />
            <line x1="80" y1="75" x2="50" y2="25" stroke="white" strokeWidth="4" />
        </svg>
    ),
    torus: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="4" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="4" />
        </svg>
    ),
    plane: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="40" width="60" height="20" fill="none" stroke="white" strokeWidth="4" rx="5" />
        </svg>
    ),
    ring: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="4" />
            <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="4" />
        </svg>
    ),
    dodecahedron: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <polygon points="30,30 70,30 80,50 50,70 20,50" fill="none" stroke="white" strokeWidth="4" />
        </svg>
    ),
    tetrahedron: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,10 80,80 20,80" fill="none" stroke="white" strokeWidth="4" />
        </svg>
    ),
    octahedron: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,20 80,50 50,80 20,50" fill="none" stroke="white" strokeWidth="4" />
        </svg>
    ),
    icosahedron: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,10 80,40 50,70 20,40" fill="none" stroke="white" strokeWidth="4" />
        </svg>
    ),
    capsule: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="30" width="40" height="40" rx="20" ry="20" fill="none" stroke="white" strokeWidth="4" />
        </svg>
    ),
    lathe: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M 50,20 Q 70,50 50,80 Q 30,50 50,20" fill="none" stroke="white" strokeWidth="4" />
        </svg>
    ),
    polyhedron: (
        <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <polygon points="30,30 70,30 70,70 30,70" fill="none" stroke="white" strokeWidth="4" />
        </svg>
    ),
};
export { shapeIcons };

const ShapeButton = ({ shape, onAddModel, isAdvancedShape }) => {
    const handleClick = () => {
        onAddModel(shape);
    };

    return (
        <span
            onClick={handleClick}
            className="toolbar-button"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }} // Align icon and text properly
        >
            {shapeIcons[shape]}
            {isAdvancedShape && <span>{shape.charAt(0).toUpperCase() + shape.slice(1)}</span>}
        </span>
    );
};

export default ShapeButton;
