import React, { useState, useEffect, useCallback } from "react";
import { FaTimes, FaFileAlt, FaSignOutAlt, FaTrash } from "react-icons/fa";
import "./styles/home.css";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { logoutUser } from "../utils/authUtils";
import LoadingPage from "./loading";
import LibraryShowcase from "./homeComponents/LibraryShowcase.jsx"; 
import { analytics, app } from "../analytics/firebaseAnalyze.js";
import { logEvent } from "firebase/analytics";
import { useLocation } from "react-router-dom";
import handleButtonClick from "../analytics/ButtonClickAnalytics.js"; 

const Home = () => {
  const navigate = useNavigate();
  const [isImportPanelOpen, setImportPanelOpen] = useState(false);
  const [isGeneratePanelOpen, setGeneratePanelOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [communityExamples, setCommunityExamples] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [projectsGridRef, setProjectsGridRef] = useState(null);
  const [tutorialsGridRef, setTutorialsGridRef] = useState(null);
  const [tutorialsVideoGridRef, setTutorialsVideoGridRef] = useState(null);
  const [projectsGridHeight, setProjectsGridHeight] = useState(0);
  const [tutorialsGridHeight, setTutorialsGridHeight] = useState(0);
  const [tutorialsVideoGridHeight, setTutorialsVideoGridHeight] = useState(0);
  const [activeMenu, setActiveMenu] = useState("Home");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const [tutorials, setTutorials] = useState([
    {
      id: 1,
      title: "Solar system tutorial",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "Learn the basics of navigating and creating in our 3D environment.",
    },
  ]);



  // Get the current location and analytics instance
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, "home_page_view", {
        page_location: location.pathname,
        page_title: document.title // Or get it from a route config
      });
    } else {
      console.warn("Analytics not initialized, page view event not logged.");
    }
  }, [location, analytics]); 

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/scenes`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        const projectsWithThumbnails = await Promise.all(
          response.data.map(async (project) => {
            if (project.thumbnail_url) {
              try {
                const thumbResponse = await axios.get(
                  `${API_BASE_URL}/get-thumbnail-url?sceneId=${project.scene_id}`,
                  { withCredentials: true }
                );
                if (thumbResponse.status === 200) {
                  return { ...project, thumbnail_url: thumbResponse.data.thumbnailUrl };
                }
              } catch (error) {
                console.error("Error fetching thumbnail:", project.scene_id, error);
                return project;
              }
            }
            return project;
          })
        );
        setProjects(projectsWithThumbnails);
      } else {
        console.error("Failed to fetch projects:", response);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchCommunityExamples = useCallback(async () => {
    setCommunityLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/community-examples`, {
        withCredentials: true,
      });
      setCommunityExamples(response.data);
    } catch (error) {
      console.error("Error fetching community examples:", error);
    } finally {
      setCommunityLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        console.log("Attempting /auth/check request...");
        const response = await axios.get(`${API_BASE_URL}/auth/check`, {
          withCredentials: true,
        });
        console.log("/auth/check response data:", response.data);

        if (isMounted && response.data && response.data.username) {
          console.log("User authenticated:", response.data.username);
          setUsername(response.data.username);
          fetchProjects();
          fetchCommunityExamples();

        } else {
          console.log("Auth check OK but no username, or component unmounted.");
          if (isMounted) {
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Error during /auth/check:", error);

        if (isMounted) {
          if (error.response) {
            console.error("Error response status:", error.response.status);
            console.error("Error response data:", error.response.data);
            if (error.response.status === 401) {
              console.log("Authentication failed (401), navigating to login.");
              navigate("/login");
            } else {
              console.log(`Server error (${error.response.status}), navigating to login.`);
              navigate("/login");
            }
          } else if (error.request) {
            console.error("No response received for /auth/check:", error.request);
            navigate("/login");
          } else {
            console.error('Error setting up request:', error.message);
            navigate("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    checkAuth();

    return () => {
      isMounted = false;
      console.log("Auth check effect unmounting.");
    };

  }, [navigate, setUsername, fetchProjects, fetchCommunityExamples, API_BASE_URL]);


  const handleFileInput = (acceptType) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = acceptType;
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  const handleImportButtonClick = () => {
    setImportPanelOpen(!isImportPanelOpen);
    setGeneratePanelOpen(false);
  };

  const handleGenerateButtonClick = () => {
    setGeneratePanelOpen(!isGeneratePanelOpen);
    setImportPanelOpen(false);
  };

  const handleClosePanel = () => {
    setImportPanelOpen(false);
    setGeneratePanelOpen(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("sceneName", file.name.split(".")[0]);
      formData.append("username", username);
      formData.append("sceneFile", file);

      const response = await axios.post(`${API_BASE_URL}/save`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        console.log("File uploaded:", response.data);
        alert("File uploaded and scene created.");
        fetchProjects();
        navigate(`/editor?sceneId=${response.data.sceneId}`);
      } else {
        console.error("File upload failed:", response);
        alert("File upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
      handleButtonClick("Logout Button Clicked", "Logout", location.pathname); 
      logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLoadExample = (exampleId) => {
    navigate(`/editor?exampleId=${exampleId}`);
    handleButtonClick("Scene", "Loading Scene", location.pathname); 
  };

  const handleTutorialClick = (videoUrl) => {
    window.open(videoUrl, '_blank');
  };

  useEffect(() => {
    if (!projectsLoading && projectsGridRef) {
      setProjectsGridHeight(projectsGridRef.clientHeight);
    }
    if (!communityLoading && tutorialsGridRef) {
      setTutorialsGridHeight(tutorialsGridRef.clientHeight);
    }
    if (tutorialsVideoGridRef) {
      setTutorialsVideoGridHeight(tutorialsVideoGridRef.clientHeight);
    }
  }, [projectsLoading, communityLoading, projectsGridRef, tutorialsGridRef, tutorialsVideoGridRef]);

  const handleWelcome = () => {
    navigate("/welcome");
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenu(menuItem);
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="home-container">
      <aside className="sidebar-home">
        <div className="profile-section">
          <div className="profile-icon">
            <img style={{ height: "38px" }} src="/3d/1logo.png" alt="" onClick={() => { handleButtonClick("Welcome Button Clicked", "Welcome", location.pathname); handleWelcome(); }} />
          </div>
          <span>{username}</span>
        </div>
        <nav className="menu">
          <Link to className={`menu-item ${activeMenu === "Home" ? "active" : ""}`} onClick={() => { handleButtonClick("Menu Clicked", "Home", location.pathname); handleMenuClick("Home"); }}>
            Home
          </Link>
          <Link to className={`menu-item ${activeMenu === "My Files" ? "active" : ""}`} onClick={() => { handleButtonClick("Menu Clicked", "My Files", location.pathname); handleMenuClick("My Files"); }}>
            My Files
          </Link>
          <Link to="/sharedwithme" className={`menu-item ${activeMenu === "Shared with Me" ? "active" : ""}`} onClick={() => { handleButtonClick("Menu Clicked", "Shared with Me", location.pathname); handleMenuClick("Shared with Me"); }}>
            Shared with Me
          </Link>
          <Link to className={`menu-item ${activeMenu === "Community" ? "active" : ""}`} onClick={() => { handleButtonClick("Menu Clicked", "Community", location.pathname); handleMenuClick("Community"); }}>
            Community
          </Link>
          <Link to className={`menu-item ${activeMenu === "Tutorials" ? "active" : ""}`} onClick={() => { handleButtonClick("Menu Clicked", "Tutorials", location.pathname); handleMenuClick("Tutorials"); }}>
            Tutorials
          </Link>
          <Link to className={`menu-item ${activeMenu === "Library" ? "active" : ""}`} onClick={() => { handleButtonClick("Menu Clicked", "Library", location.pathname); handleMenuClick("Library"); }}>
            Library
          </Link>
          <Link to="/inbox" className={`menu-item ${activeMenu === "Inbox" ? "active" : ""}`} onClick={() => { handleButtonClick("Menu Clicked", "Inbox", location.pathname); handleMenuClick("Inbox"); }}>
            Inbox
          </Link>
        </nav>
        <div className="upgrade-section">
          <button className="upgrade-button" onClick={() => handleButtonClick("Upgrade Button Clicked", "Upgrade", location.pathname)}>Upgrade</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar" style={{ display: activeMenu === 'Home' ? 'flex' : 'none', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Welcome to the 3D space</h1>
          <div className="logbtn">
            <button className="upgrade-button" onClick={() => { handleButtonClick("Logout Button Clicked", "Logout", location.pathname); handleLogout(); }}>
              <FaSignOutAlt style={{ marginRight: "5px" }} />
              Logout
            </button>
          </div>
        </header>

        {isImportPanelOpen && activeMenu === 'Home' && (
          <div className="import-home">
            <div className="import-panel-header">
              <h2>Import or Drag & Drop</h2>
              <FaTimes className="close-icon" onClick={() => { handleButtonClick("Close Panel Clicked", "Close Import Panel", location.pathname); handleClosePanel(); }} />
            </div>
            <div className={`drag-drop-area ${dragOver ? "drag-over" : ""}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              <p>Drag & Drop files here or choose an option below</p>
            </div>
            <div className="import-options">
              <button className="import-option" onClick={() => { handleButtonClick("Import Option Clicked", "3D Model Import", location.pathname); handleFileInput(".gltf,.glb,.stl,.fbx,.obj"); }}>
                3D Model (GLTF, STL, FBX, OBJ)
              </button>
            </div>
          </div>
        )}

        {isGeneratePanelOpen && activeMenu === 'Home' && (
          <div className="import-panel">
            <div className="import-panel-header">
              <h2>Generate</h2>
              <FaTimes className="close-icon" onClick={() => { handleButtonClick("Close Panel Clicked", "Close Generate Panel", location.pathname); handleClosePanel(); }} />
            </div>
            <div className="import-options">
              <button className="import-option" onClick={() => { handleButtonClick("Generate Option Clicked", "2D to 3D", location.pathname); navigate("/2dimageto3dmodel"); }}>
                2D Image to 3D Model
              </button>
              <button className="import-option" onClick={() => { handleButtonClick("Generate Option Clicked", "Polymodel Conversion", location.pathname); navigate("/polymodel"); }}>
                Polymodel Conversion
              </button>
            </div>
          </div>
        )}

        {(activeMenu === "Home" || activeMenu === 'My Files') && (
          <section className="projects">
            <h2>Your Projects</h2>
            <div className="projects-grid" ref={setProjectsGridRef} style={{ minHeight: projectsGridHeight }}>
              <div onClick={() => { handleButtonClick("New File Clicked", "New File", location.pathname); navigate("/editor"); }} className="project-card new-file">
                <FaFileAlt style={{ marginRight: "8px" }} />
                <p>New File</p>
              </div>
              {projectsLoading ? (
                <>
                  <div className="project-card skeleton-loading">
                    <div className="project-thumbnail skeleton-loading"></div>
                    <p className="project-title skeleton-loading"></p>
                  </div>
                  <div className="project-card skeleton-loading">
                    <div className="project-thumbnail skeleton-loading"></div>
                    <p className="project-title skeleton-loading"></p>
                  </div>
                  <div className="project-card skeleton-loading">
                    <div className="project-thumbnail skeleton-loading"></div>
                    <p className="project-title skeleton-loading"></p>
                  </div>
                  <div className="project-card skeleton-loading">
                    <div className="project-thumbnail skeleton-loading "></div>
                    <p className="project-title skeleton-loading"></p>
                  </div>
                </>
              ) : (
                projects.map((project) => (
                  <div key={project.scene_id} className="project-card" onClick={() => { handleButtonClick("Project Clicked", project.scene_name, location.pathname); navigate(`/editor?sceneId=${project.scene_id}`); }}>
                    <div className="project-thumbnail">
                      {project.thumbnail_url ? (
                        <img src={project.thumbnail_url} alt={project.scene_name} />
                      ) : (
                        <div className="project-thumbnail"></div>
                      )}
                    </div>
                    <p className="project-title">{project.scene_name}</p>
                    <FaTrash
                      style={{
                        position: "absolute",
                        marginLeft: "248px",
                        marginTop: "245px",
                        color: "rgba(255, 255, 255, 0.93)",
                        cursor: "pointer",
                      }}
                      onClick={() => handleButtonClick("Delete Project Clicked", project.scene_name, location.pathname)}
                    />
                    <p className="lastupdated">Last updated {project.last_updated}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {(activeMenu === "Home" || activeMenu === 'Community') && (
          <section className="tutorials">
            <h2>Community Examples</h2>
            <div className="tutorials-grid" ref={setTutorialsGridRef} style={{ minHeight: tutorialsGridHeight }}>
              {communityLoading ? (
                <>
                  <div className="tutorial-card skeleton-loading">
                    <div className="project-thumbnail skeleton-loading"></div>
                    <p className="project-title skeleton-loading"></p>
                  </div>
                  <div className="tutorial-card skeleton-loading">
                    <div className="project-thumbnail skeleton-loading"></div>
                    <p className="project-title skeleton-loading"></p>
                  </div>
                  <div className="tutorial-card skeleton-loading">
                    <div className="project-thumbnail skeleton-loading"></div>
                    <p className="project-title skeleton-loading"></p>
                  </div>
                  <div className="tutorial-card skeleton-loading">
                    <div className="project-thumbnail skeleton-loading"></div>
                    <p className="project-title skeleton-loading"></p>
                  </div>
                </>
              ) : (
                communityExamples.map((example) => (
                  <div key={example.example_id} className="tutorial-card" onClick={() => { handleButtonClick("Community Example Clicked", example.example_name, location.pathname); handleLoadExample(example.example_id); }}>
                    <div className="project-thumbnail">
                      {example.thumbnail_s3_key ? (
                        <img
                          src={`${example.thumbnail_s3_key}`}
                          alt={example.example_name}
                          className="example-thumbnail"
                        />
                      ) : (
                        <div className="project-thumbnail"></div>
                      )}
                    </div>
                    <p className="project-title">{example.example_name}</p>
                    <p>{example.description}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {(activeMenu === "Home" || activeMenu === 'Tutorials') && (
          <section className="tutorials-video">
            <h2>Tutorials</h2>
            <div className="tutorials-grid" ref={tutorialsVideoGridRef} style={{ minHeight: tutorialsVideoGridHeight }}>
              {tutorials.map((tutorial) => (
                <div key={tutorial.id} className="tutorial-card" onClick={() => { handleButtonClick("Tutorial Clicked", tutorial.title, location.pathname); handleTutorialClick(tutorial.videoUrl); }}>
                  <iframe
                    width="100%"
                    height="200"
                    src={tutorial.videoUrl}
                    title={tutorial.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <p className="project-title">{tutorial.title}</p>
                  <p>{tutorial.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {activeMenu === "Library" && (
          <section className="library-section">
            <LibraryShowcase />
          </section>
        )}

      </main>
    </div>
  );
};

export default Home;