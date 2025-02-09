import React, { useState, useRef, useEffect} from "react";
import { FaBook } from 'react-icons/fa';

const Library = () => {
    const [showLibraryPanel, setShowLibraryPanel] = useState(false);

    const libraryPanelRef = useRef(null);

    // Close the panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (libraryPanelRef.current && !libraryPanelRef.current.contains(event.target)) {
                setShowLibraryPanel(false);
            }
        };

        if (showLibraryPanel) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showLibraryPanel]);

    return (
        <div>
            <button onClick={() => setShowLibraryPanel(true)}>
                <FaBook /> {/* Add the FaBook icon */}
                <span>Library</span> {/* Optional: Add text next to the icon */}
            </button>
            {showLibraryPanel && (
                    <div className="library-panel" ref={libraryPanelRef}>
                        <h3>Library</h3>
                        <div className="library-content">
                            <div className="search-bar-container">
                                <input type="text" placeholder="Search..." className="search-input" />
                            </div>
                            <div className="library-categories">
                                <button className="category-button selected">All</button>
                                <button className="category-button">3D Icons</button>
                                <button className="category-button">Bag</button>
                                <button className="category-button">Bottles</button>
                                <button className="category-button">Boxes</button>
                                <button className="category-button">Buildings</button>
                                <button className="category-button">Character</button>
                                <button className="category-button">Christmas</button>
                                <button className="category-button">Cleaning</button>
                            </div>
                            <div className="library-items">
                                <div className="library-section">
                                    <h4>3D Icons</h4>
                                    <div className="library-grid">
                                        <div className="library-item">Key</div>
                                        <div className="library-item">Hurted Heart</div>
                                        <div className="library-item">Crystal Ball</div>
                                        <div className="library-item">Mouth</div>
                                    </div>
                                </div>
                                <div className="library-section">
                                    <h4>Bag</h4>
                                    <div className="library-grid">
                                        <div className="library-item">Small Bag</div>
                                        <div className="library-item">Pouch Bag</div>
                                        <div className="library-item">Plastic Bag</div>
                                        <div className="library-item">Small Paper Bag</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button className="modal-buttons close-button" onClick={() => setShowLibraryPanel(false)}>
                            Close
                        </button>
                    </div>
            )}
        </div>
    );
};

export default Library;