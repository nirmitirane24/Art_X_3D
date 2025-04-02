// LibraryShowcase.jsx
import React, { useState, useEffect, useCallback, memo } from "react";
import "./Libraryloading.css"; // Ensure this CSS file exists and has relevant styles

const LibraryShowcaseComponent = () => {
  const [libraryModels, setLibraryModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [cachedModels, setCachedModels] = useState(null); // State to hold cached models
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if models are already cached
      if (cachedModels) {
        setLibraryModels(cachedModels);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/library/models`); // Fetch all models
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
      const data = await response.json();

      // Cache the fetched models
      setCachedModels(data);
      setLibraryModels(data);
    } catch (error) {
      console.error("Error fetching library models:", error);
      alert("Failed to fetch library models. Check the console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, cachedModels]); // Added API_BASE_URL as a dependency

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const filteredModels = libraryModels.filter((model) => {
    const searchMatch = model.model_name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === "All" || model.model_category === selectedCategory;
    return searchMatch && categoryMatch;
  });

  const categories = ["All", ...new Set(libraryModels.map((model) => model.model_category))];

  return (
    <div className="library-showcase">
      <h2>Library Models</h2>

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="category-home-buttons">
        {categories.map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? "active" : ""}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="library-home-grid">
          {filteredModels.map((model) => (
            <div key={model.id} className="library-home-item">
              <img
                src={model.model_image}
                alt={model.model_name}
                style={{ width: "200px", height: "200px", marginTop: "-20px" }}
              />
              <p style={{ marginTop: "-25px" }}>{model.model_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LibraryShowcase = memo(LibraryShowcaseComponent);

export default LibraryShowcase;