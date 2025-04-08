import React, { useState, useEffect, useCallback, useRef } from "react"; // Added useRef
import axios from "axios";
import "./TutorialsShowcase.css";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../analytics/firebaseAnalyze";
import { useLocation } from "react-router-dom";
import handleButtonClick from "../../analytics/ButtonClickAnalytics";
import { FaTimes } from "react-icons/fa"; // Import close icon

const API_BASE_URL = import.meta.env.VITE_API_URL;

const TutorialsShowcase = () => {
  const [tutorials, setTutorials] = useState([]);
  const [listLoading, setListLoading] = useState(true); // Renamed for clarity
  const [error, setError] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null); // Track active video ID
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null); // Store fetched URL
  const [isVideoUrlLoading, setIsVideoUrlLoading] = useState(false); // Loading state for URL fetch
  const location = useLocation();
  const videoRefs = useRef({}); // To manage video elements if needed

  const fetchTutorials = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/tutorials`, {
        withCredentials: true,
      });
      setTutorials(response.data);
      if (analytics) {
        logEvent(analytics, "tutorials_loaded", { count: response.data.length });
      }
    } catch (err) {
      console.error("Error fetching tutorials:", err);
      setError("Failed to load tutorials. Please try again later.");
      if (analytics) {
        logEvent(analytics, "tutorials_load_failed", { error_message: err.message });
      }
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  // Function to close the video player
  const handleClosePlayer = (e) => {
    // Prevent click event from bubbling up to the card's onClick
    if (e) e.stopPropagation();
    setSelectedVideoId(null);
    setCurrentVideoUrl(null);
    // Optional: Pause the video if needed (more complex state management)
  };

  const handleTutorialClick = async (tutorial) => {
    // If this video is already selected, close it
    if (selectedVideoId === tutorial.id) {
        handleClosePlayer();
        return;
    }

    handleButtonClick("Tutorial Clicked", tutorial.title, location.pathname);
    setIsVideoUrlLoading(true); // Start loading indicator for this specific action
    setSelectedVideoId(tutorial.id); // Tentatively select
    setCurrentVideoUrl(null); // Clear previous URL
    setError(null); // Clear previous errors

    try {
      const response = await axios.get(`${API_BASE_URL}/tutorials/${tutorial.id}/signed_url`, {
        withCredentials: true,
      });
      const videoUrl = response.data.signed_url;

      if (videoUrl) {
        setCurrentVideoUrl(videoUrl); // Set the URL to be used by the video tag
        if (analytics) {
          logEvent(analytics, "tutorial_video_url_loaded", {
            tutorial_id: tutorial.id,
            tutorial_title: tutorial.title,
          });
        }
        // Video will auto-play due to 'autoPlay' attribute below
      } else {
        console.error("No signed URL received for tutorial:", tutorial.id);
        setError("Could not retrieve video URL.");
        setSelectedVideoId(null); // Deselect if URL fetch failed
        if (analytics) {
          logEvent(analytics, "tutorial_video_url_failed", {
            tutorial_id: tutorial.id,
            tutorial_title: tutorial.title,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching signed URL for tutorial:", err);
      setError("Failed to get video link. Please try again.");
      setSelectedVideoId(null); // Deselect on error
      if (analytics) {
        logEvent(analytics, "tutorial_video_url_fetch_error", {
          tutorial_id: tutorial.id,
          tutorial_title: tutorial.title,
          error_message: err.message,
        });
      }
    } finally {
      setIsVideoUrlLoading(false); // Stop loading indicator
    }
  };

  return (
    <div className="video-tutorial-showcase-container">
      <h2>Tutorials</h2>
      {/* Display general list errors or specific video URL errors */}
      {error && <p className="video-tutorial-error-message">{error}</p>}

      <div className="video-tutorial-grid">
        {listLoading ? ( // Skeleton for the initial list loading
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="video-tutorial-card video-tutorial-skeleton-loading">
              <div className="video-tutorial-aspect-outer">
                <div className="video-tutorial-aspect-inner video-tutorial-skeleton-inner"></div>
              </div>
              <div className="video-tutorial-info video-tutorial-skeleton-info">
                <div className="video-tutorial-skeleton-text video-tutorial-skeleton-text--short"></div>
                <div className="video-tutorial-skeleton-text video-tutorial-skeleton-text--long"></div>
                <div className="video-tutorial-skeleton-badge"></div>
              </div>
            </div>
          ))
        ) : tutorials.length > 0 ? (
          tutorials.map((tutorial) => {
            const isSelected = selectedVideoId === tutorial.id;
            const showVideoPlayer = isSelected && currentVideoUrl;
            const showThumbnailLoading = isSelected && isVideoUrlLoading;

            return (
              <div
                key={tutorial.id}
                className={`video-tutorial-card ${isSelected ? 'video-tutorial-card--selected' : ''}`}
                onClick={() => handleTutorialClick(tutorial)} // Keep onClick on the card
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTutorialClick(tutorial); }}
              >
                <div className="video-tutorial-aspect-outer">
                  <div className="video-tutorial-aspect-inner">
                    {/* --- Conditional Rendering Logic --- */}
                    {showVideoPlayer ? (
                      <div className="video-player-wrapper">
                         {/* Close Button */}
                         <button
                           className="video-close-button"
                           onClick={handleClosePlayer}
                           aria-label="Close video player"
                         >
                           <FaTimes />
                         </button>
                        <video
                          ref={(el) => (videoRefs.current[tutorial.id] = el)} // Store ref if needed
                          src={currentVideoUrl}
                          controls // Add browser default controls
                          autoPlay // Attempt to autoplay
                          muted // Often required for autoplay to work
                          playsInline // Important for mobile browsers
                          width="100%" // Ensure video fills container
                          height="100%"
                          onEnded={handleClosePlayer} // Optional: Close when video finishes
                          onError={(e) => {
                              console.error("Video playback error:", e);
                              setError(`Error playing video: ${tutorial.title}`);
                              handleClosePlayer(); // Close on error
                          }}
                        ></video>
                      </div>
                    ) : showThumbnailLoading ? (
                        // Loading indicator specifically for the video URL fetch
                        <div className="video-thumbnail-loading">
                            <div className="spinner"></div> {/* Add a spinner CSS */}
                            <p>Loading Video...</p>
                        </div>
                    ) : (
                      // Default Thumbnail View
                      <>
                        {tutorial.thumbnail_url ? (
                          <div className="video-tutorial-thumbnail-container">
                            <img src={tutorial.thumbnail_url} alt={`${tutorial.title} thumbnail`} loading="lazy" />

                          </div>
                        ) : (
                          <div className="video-tutorial-thumbnail-placeholder">No Thumbnail</div>
                        )}
                      </>
                    )}
                     {/* --- End Conditional Rendering Logic --- */}
                  </div>
                </div>
                <div className="video-tutorial-info">
                  <h3>{tutorial.title}</h3>
                  <p>{tutorial.description}</p>
                </div>
              </div>
            );
          })
        ) : (
          !listLoading && <p>No tutorials available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default TutorialsShowcase;