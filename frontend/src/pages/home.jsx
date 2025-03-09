// --- home.jsx ---

import React, { useState, useEffect } from "react";
import { FaTimes, FaFileAlt, FaSignOutAlt } from "react-icons/fa";
import "./styles/home.css";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { logoutUser } from "../utils/authUtils";
import LoadingPage from "./loading";

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
  const [projectsGridRef, setProjectsGridRef] = useState(null); // Ref for projects grid
  const [tutorialsGridRef, setTutorialsGridRef] = useState(null); // Ref for tutorials grid
  const [projectsGridHeight, setProjectsGridHeight] = useState(0); // Height of projects grid
  const [tutorialsGridHeight, setTutorialsGridHeight] = useState(0); // Height of tutorials grid
  const [activeMenu, setActiveMenu] = useState("Home"); // Keep track of the active menu item

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:5050/auth/check", {
          withCredentials: true,
        });
        console.log("User authenticated:", response.data);
        if (response.data.username === undefined || response.data.username === null) {
          navigate("/");
        }
        setUsername(response.data.username);
        fetchProjects();
        fetchCommunityExamples();
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/");
        } else {
          console.error("Error checking authentication:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await axios.get("http://localhost:5050/scenes", {
        withCredentials: true,
      });
      if (response.status === 200) {
        const projectsWithThumbnails = await Promise.all(
          response.data.map(async (project) => {
            if (project.thumbnail_url) {
              try {
                const thumbResponse = await axios.get(
                  `http://localhost:5050/get-thumbnail-url?sceneId=${project.scene_id}`,
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
  };

  const fetchCommunityExamples = async () => {
    setCommunityLoading(true);
    try {
      const response = await axios.get("http://localhost:5050/community-examples", {
        withCredentials: true,
      });
      setCommunityExamples(response.data);
    } catch (error) {
      console.error("Error fetching community examples:", error);
    } finally {
      setCommunityLoading(false);
    }
  };

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

      const response = await axios.post("http://localhost:5050/save", formData, {
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
      await axios.post("http://localhost:5050/auth/logout", {}, { withCredentials: true });
      logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLoadExample = (exampleId) => {
    navigate(`/editor?exampleId=${exampleId}`);
  };

    // UseEffect to measure and set grid heights after loading
  useEffect(() => {
    if (!projectsLoading && projectsGridRef) {
      setProjectsGridHeight(projectsGridRef.clientHeight);
    }
    if (!communityLoading && tutorialsGridRef) {
      setTutorialsGridHeight(tutorialsGridRef.clientHeight);
    }
  }, [projectsLoading, communityLoading, projectsGridRef, tutorialsGridRef]);

  const handleWelcome = () => {
    navigate("/welcome");
  }

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
            <img style={{ height: "38px" }} src="/3d/1logo.png" alt="" onClick={{handleWelcome}} />
          </div>
          <span>{username}</span>
        </div>
        <nav className="menu">
          <Link to className={`menu-item ${activeMenu === "Home" ? "active" : ""}`} onClick={() => handleMenuClick("Home")}>
            Home
          </Link>
          <Link to className={`menu-item ${activeMenu === "My Files" ? "active" : ""}`} onClick={() => handleMenuClick("My Files")}>
            My Files
          </Link>
          <Link to="/sharedwithme" className={`menu-item ${activeMenu === "Shared with Me" ? "active" : ""}`} onClick={() => handleMenuClick("Shared with Me")}>
            Shared with Me
          </Link>
          <Link to className={`menu-item ${activeMenu === "Community" ? "active" : ""}`} onClick={() => handleMenuClick("Community")}>
            Community
          </Link>
          <Link to="/tutorials" className={`menu-item ${activeMenu === "Tutorials" ? "active" : ""}`} onClick={() => handleMenuClick("Tutorials")}>
            Tutorials
          </Link>
          <Link to="/library" className={`menu-item ${activeMenu === "Library" ? "active" : ""}`} onClick={() => handleMenuClick("Library")}>
            Library
          </Link>
          <Link to="/inbox" className={`menu-item ${activeMenu === "Inbox" ? "active" : ""}`} onClick={() => handleMenuClick("Inbox")}>
            Inbox
          </Link>
        </nav>
        <div className="upgrade-section">
          <button className="upgrade-button">Upgrade</button>

        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar" style={{ display: activeMenu === 'Home' ? 'flex' : 'none', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Welcome to the 3D space</h1>
          <div className="logbtn">
            <button className="upgrade-button" onClick={handleLogout}>
              <FaSignOutAlt style={{ marginRight: "5px" }} />
              Logout
            </button>
          </div>
        </header>


        {isImportPanelOpen && activeMenu === 'Home' && (
          <div className="import-home">
            <div className="import-panel-header">
              <h2>Import or Drag & Drop</h2>
              <FaTimes className="close-icon" onClick={handleClosePanel} />
            </div>
            <div className={`drag-drop-area ${dragOver ? "drag-over" : ""}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              <p>Drag & Drop files here or choose an option below</p>
            </div>
            <div className="import-options">
              <button className="import-option" onClick={() => handleFileInput(".gltf,.glb,.stl,.fbx,.obj")}>
                3D Model (GLTF, STL, FBX, OBJ)
              </button>
            </div>
          </div>
        )}

        {isGeneratePanelOpen && activeMenu === 'Home' &&(
          <div className="import-panel">
            <div className="import-panel-header">
              <h2>Generate</h2>
              <FaTimes className="close-icon" onClick={handleClosePanel} />
            </div>
            <div className="import-options">
              <button className="import-option" onClick={() => navigate("/2dimageto3dmodel")}>
                2D Image to 3D Model
              </button>
              <button className="import-option" onClick={() => navigate("/polymodel")}>
                Polymodel Conversion
              </button>
              <button className="import-option" onClick={() => navigate("#")}>
                Dummy Button 1
              </button>
              <button className="import-option" onClick={() => navigate("#")}>
                Dummy Button 2
              </button>
              <button className="import-option" onClick={() => navigate("#")}>
                Dummy Button 3
              </button>
            </div>
          </div>
        )}

        {/* Show Projects and Community Examples when Home is active */}
        {(activeMenu === "Home" || activeMenu === 'My Files') && (
          <section className="projects">
            <h2>Your Projects</h2>
            <div className="projects-grid" ref={setProjectsGridRef} style={{ minHeight: projectsGridHeight }}>
              <div onClick={() => navigate("/editor")} className="project-card new-file">
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
                  <div key={project.scene_id} className="project-card" onClick={() => navigate(`/editor?sceneId=${project.scene_id}`)}>
                    <div className="project-thumbnail">
                      {project.thumbnail_url ? (
                        <img src={project.thumbnail_url} alt={project.scene_name} />
                      ) : (
                        <div className="project-thumbnail"></div>
                      )}
                    </div>
                    <p className="project-title">{project.scene_name}</p>
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
                  <div key={example.example_id} className="tutorial-card" onClick={() => handleLoadExample(example.example_id)}>
                    <div className="project-thumbnail">
                      {example.thumbnail_s3_key ? (
                        <img
                          src={`${example.thumbnail_s3_key}`}
                          alt={example.example_name}
                          className="example-thumbnail"
                        />
                      ) : (
                        <div className="project-thumbnail"></div> // Keep this for consistent layout
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
      </main>
    </div>
  );
};

export default Home;