// src/components/HierarchyPanel.jsx
import React, { useState } from 'react';
import '../styles/hierarchyPanel.css';

const HierarchyPanel = ({ sceneObjects, onObjectSelect, selectedObjects }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredObjects = sceneObjects.filter((obj) => {
        return obj.type.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="hierarchy-panel">
            <div className="header-section">
                <h3>Objects</h3>
            </div>
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
            />
            <ul className="objects-list">
                {filteredObjects.map((obj) => (
                    <li
                        key={obj.id}
                        className={selectedObjects.includes(obj.id) ? 'selected' : ''}
                        onClick={(e) => {
                            e.stopPropagation();
                            onObjectSelect([obj.id]);
                        }}
                    >
                        <span className="object-type">{obj.type}</span>
                        <span className="object-id">({obj.id})</span>
                    </li>
                ))}
            </ul>
            <div className="panel-buttons">
                <button className="panel-button">Import</button>
                <button className="panel-button">Library</button>
            </div>
        </div>
    );
};

export default HierarchyPanel;