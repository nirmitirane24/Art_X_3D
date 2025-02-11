// src/components/toolbar/LightButton.jsx
import React from "react";

const LightIcons = {
    pointLight: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2"/>
        </svg>
    ),
    spotLight: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="5" stroke="white" strokeWidth="2"/>
            <path d="M12 13L16 20M12 13L8 20M12 13V18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
    directionalLight: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2"/>
            <path d="M12 4V20M4 12H20" stroke="white" strokeWidth="2"/>
            <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
};

const LightButton = ({ type, onAddLight }) => {
    return (
        <button 
            onClick={() => onAddLight(type)} 
            className="lightbtns"
        >
            {LightIcons[type] || null}
            <span className="text-white capitalize">{type.replace(/([A-Z])/g, " $1")}</span>
        </button>
    );
};

export default LightButton;