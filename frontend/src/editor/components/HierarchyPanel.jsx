// src/components/HierarchyPanel.jsx
import React from 'react';
import '../styles/hierarchyPanel.css'; // Import the CSS


const HierarchyPanel = ({ sceneObjects, onObjectSelect, selectedObjects }) => {
    return (
        <div className="hierarchy-panel">
            <h3>Hierarchy</h3>
            <ul>
                {sceneObjects.map((obj) => (
                    <li
                        key={obj.id}
                        className={selectedObjects.includes(obj.id) ? 'selected' : ''}
                        onClick={(e) => {
                            e.stopPropagation();
                            onObjectSelect([obj.id]);
                        }}
                    >
                        {obj.type} ({obj.id})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HierarchyPanel;