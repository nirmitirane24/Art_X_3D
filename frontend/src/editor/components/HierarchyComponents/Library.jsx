// --- HierarchyComponents/Library.jsx ---
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaBook, FaTimes } from 'react-icons/fa';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import "./libraryloading.css";

const Library = ({ onImportScene, savetoUndoStack }) => {
    const [showLibraryPanel, setShowLibraryPanel] = useState(false);
    const [libraryModels, setLibraryModels] = useState([]);  // Store model data
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isLoading, setIsLoading] = useState(false);
    const libraryPanelRef = useRef(null);
    const [modelCache, setModelCache] = useState({});  // Cache for loaded models
    const [modelInfoCache, setModelInfoCache] = useState({}); //Cache for model information.
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    
    // Fetch models (using useCallback for memoization)
    const fetchModels = useCallback(async (category) => {
        setIsLoading(true);
        try {
            // Check if we have cached data for this category
            if (modelInfoCache[category]) {
                setLibraryModels(modelInfoCache[category]);
                setIsLoading(false);
                return;
            }

            let url = `${API_BASE_URL}/library/models`;
            if (category && category !== "All") {
                url += `?category=${category}`;
            }
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.status}`);
            }
            const data = await response.json();
            setLibraryModels(data);

            // Cache the fetched data
            setModelInfoCache(prevCache => ({ ...prevCache, [category]: data }));

        } catch (error) {
            console.error("Error fetching library models:", error);
            alert("Failed to fetch library models. Check the console for details.");
        } finally {
            setIsLoading(false);
        }
    }, [modelInfoCache]);  // Add modelInfoCache to dependency array


    useEffect(() => {
        if (showLibraryPanel) {
            fetchModels(selectedCategory);
        }

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
    }, [showLibraryPanel, selectedCategory, fetchModels]); // Include fetchModels in dependency array


    const handleImport = async (modelId, modelName) => {
        setIsLoading(true);
    
        if (savetoUndoStack) {
            savetoUndoStack(); // Save current state
        }
    
        // Check if the model is already in cache
        if (modelCache[modelId]) {
            onImportScene({ ...modelCache[modelId], displayId: modelName });
            setShowLibraryPanel(false);
            setIsLoading(false);
            return;
        }
    
        try {
            const urlResponse = await fetch(`${API_BASE_URL}/library/models/${modelId}/signed_url`);
            if (!urlResponse.ok) {
                throw new Error(`Failed to get signed URL: ${urlResponse.status} ${urlResponse.statusText}`);
            }
            const { signed_url } = await urlResponse.json();
    
            if (!signed_url) {
                throw new Error("Received an empty signed URL.");
            }
    
            console.log("Attempting to load model from:", signed_url);
    
            const url = new URL(signed_url);
            const pathname = url.pathname;
            const extension = pathname.split(".").pop().toLowerCase();
    
            let loader;
            switch (extension) {
                case "gltf":
                    loader = new GLTFLoader();
                    var dracoLoader = new DRACOLoader();
                    dracoLoader.setDecoderPath('/draco/');
                    loader.setDRACOLoader(dracoLoader);
                    break;
                case "glb":
                    loader = new GLTFLoader();
                    var dracoLoader = new DRACOLoader();
                    dracoLoader.setDecoderPath('/draco/');
                    loader.setDRACOLoader(dracoLoader);
                    break;
                case "obj":
                    loader = new OBJLoader();
                    break;
                case "fbx":
                    loader = new FBXLoader();
                    break;
                case "stl":
                    loader = new STLLoader();
                    break;
                default:
                    console.error("Unsupported file format:", extension);
                    alert(`Unsupported file format: ${extension}`);
                    setIsLoading(false);
                    return;
            }
    
            loader.load(signed_url, (loadedData) => {
                let scene = loadedData.scene || loadedData;
                
                // Assign model name for hierarchy
                scene.displayId = modelName;
    
                // Cache model
                setModelCache(prevCache => ({ ...prevCache, [modelId]: scene }));
                
                onImportScene(scene);
                setShowLibraryPanel(false);
                setIsLoading(false);
            }, undefined, (error) => {
                console.error('An error happened during model loading:', error);
                alert(`Failed to load model: ${error.message}`);
                setIsLoading(false);
            });
    
        } catch (error) {
            console.error("Error importing model:", error);
            alert(`Failed to import model: ${error.message}`);
            setIsLoading(false);
        }
    };
    
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredModels = libraryModels.filter((model) =>
        model.model_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "All" || model.model_category === selectedCategory)
    );

    const categories = ["All", ...new Set(libraryModels.map((model) => model.model_category))];

    return (
        <div>
            <button onClick={() => setShowLibraryPanel(true)} disabled={isLoading}>
                <FaBook />
                <span>Library</span>
            </button>
            {showLibraryPanel && (
                <div className="library-panel" ref={libraryPanelRef}>
                    <FaTimes
                        onClick={() => setShowLibraryPanel(false)}
                        style={{ position: "absolute", top: "10px", right: "10px", cursor: "pointer", fontSize: "20px" }}
                    />

                    {/* Loading Spinner */}
                    {isLoading && (
                        <div className="loading-spinner-container">
                            <div className="loading-spinner"></div>
                        </div>
                    )}

                    <div className="library-content">
                        <div className="search-bar-container">
                            <input type="text" placeholder="Search..." className="search-input" value={searchTerm} onChange={handleSearchChange} />
                        </div>
                        <div className="library-categories">
                            {categories.map((category) => (
                                <button key={category} className={`category-button ${selectedCategory === category ? "selected" : ""}`} onClick={() => setSelectedCategory(category)}>
                                    {category}
                                </button>
                            ))}
                        </div>
                        <div className="library-items">
                            {!isLoading && filteredModels.length === 0 && <p>No models found.</p>}
                            {!isLoading && filteredModels.length > 0 && (
                                <div className="library-grid">
                                    {filteredModels.map((model) => (
                                        <div key={model.id} className="library-item" onClick={() => handleImport(model.id, model.model_name)}>
                                            <img src={model.model_image} alt={model.model_name} style={{ width: "150px", height: "150px", marginTop: "-20px" }} />
                                            <p style={{ marginTop: '-25px' }}>{model.model_name}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Library;