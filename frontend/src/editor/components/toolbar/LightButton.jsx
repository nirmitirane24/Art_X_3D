// src/components/toolbar/LightButton.jsx
import React from 'react';

const lightIcons = {
    pointLight: (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Basic circle for Point Light */}
            <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2"/>
        </svg>
    ),
    spotLight: (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Circle with a cone-like shape */}
            <circle cx="12" cy="8" r="5" stroke="white" strokeWidth="2"/>
            <path d="M12 13L16 20M12 13L8 20M12 13V18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
    directionalLight: (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
           {/* Circle with arrows */}
            <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2"/>
            <path d="M12 6V18M6 12H18" stroke="white" strokeWidth="2"/> {/* Crosshair */}
            <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
};
export {lightIcons};

const LightButton = ({ type, onAddLight }) => {
    const handleClick = () => {
        onAddLight(type);
    };

    return (
        <span onClick={handleClick} className="toolbar-button">
            {lightIcons[type]}
            {/* Optional: Display the light type name */}
            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
        </span>
    );
};

export default LightButton;