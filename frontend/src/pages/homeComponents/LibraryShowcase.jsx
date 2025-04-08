// LibraryShowcase.jsx
import React, { useState, useEffect, useCallback, memo } from "react";
import "./Libraryloading.css";

const LibraryShowcaseComponent = () => {
  const [libraryModels, setLibraryModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [cachedModels, setCachedModels] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [availableCategories, setAvailableCategories] = useState(["All"]);

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if models are already cached
      if (cachedModels) {
        setLibraryModels(cachedModels);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/library/models`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
      const data = await response.json();

      // Cache the fetched models
      setCachedModels(data);
      setLibraryModels(data);
      
      // Update available categories
      const categories = ["All", ...new Set(data.map((model) => model.model_category))];
      setAvailableCategories(categories);
    } catch (error) {
      console.error("Error fetching library models:", error);
      alert("Failed to fetch library models. Check the console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, cachedModels]);

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

  // Skeleton placeholder items - dynamically determine count based on filtered models
  const skeletonCount = filteredModels.length > 0 ? filteredModels.length : 15;
  const skeletonItems = Array(skeletonCount).fill(0).map((_, index) => (
    <div key={`skeleton-${index}`} className="library-home-item skeleton">
      <div className="skeleton-image"></div>
      <div className="skeleton-text"></div>
    </div>
  ));

  // Render skeleton categories or actual categories
  const renderCategories = () => {
    if (isLoading && availableCategories.length <= 1) {
      // Only show skeleton categories during initial load
      return Array(5).fill(0).map((_, index) => (
        <div key={`skeleton-cat-${index}`} className="skeleton-button"></div>
      ));
    } else {
      // Show actual categories (either from cached data or newly fetched)
      return availableCategories.map((category) => (
        <button
          key={category}
          className={selectedCategory === category ? "active" : ""}
          onClick={() => handleCategoryChange(category)}
        >
          {category}
        </button>
      ));
    }
  };

  return (
    <div className="library-showcase">
      <h2>Library Models</h2>

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={isLoading && availableCategories.length <= 1}
        />
      </div>

      <div className="category-home-buttons">
        {renderCategories()}
      </div>

      <div className="library-home-grid">
        {isLoading ? 
          skeletonItems : 
          filteredModels.map((model) => (
            <div key={model.id} className="library-home-item">
              <img
                className="library-home-image"
                src={model.model_image}
                alt={model.model_name}
                style={{ width: "200px", height: "200px", marginTop: "-20px" }}
              />
              <p style={{ marginTop: "-25px" }}>{model.model_name}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
};

const LibraryShowcase = memo(LibraryShowcaseComponent);

export default LibraryShowcase;