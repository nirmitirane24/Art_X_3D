import React, { useState, useEffect } from "react";
import { FaTimes, FaFileAlt, FaSignOutAlt } from "react-icons/fa";
import "./styles/home.css";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { logoutUser } from "../utils/authUtils";  // Import logoutUser
import LoadingPage from "./loading";

const Home = () => {
  const navigate = useNavigate();
  const [isImportPanelOpen, setImportPanelOpen] = useState(false);
  const [isGeneratePanelOpen, setGeneratePanelOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Attempt to fetch protected data (user logs).
        await axios.get("http://localhost:5050/user/logs", { withCredentials: true });
        setUsername(localStorage.getItem("username")); // Use stored username.
      } catch (error) {
        // If unauthorized (401), redirect to welcome page.
        if (error.response && error.response.status === 401) {
          navigate("/");  // <--- Redirect to WELCOME page
        } else {
          console.error("Error checking authentication:", error);
          // Optionally: Show an error message to the user.
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]); // Dependency array is important


    const handleFileInput = (acceptType) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = acceptType;
        input.onchange = (e) => {
            const file = e.target.files[0];
            if(file) {
                console.log(`Selected file: ${file.name}`);
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
         const file = files[0];
         console.log(`Dropped file: ${file.name}`);
         // Handle file upload logic here
     }
 };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5050/auth/logout", {}, { withCredentials: true });
      logoutUser(); // Remove username from local storage
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return <LoadingPage/>;
  }

  return (
    // ... (rest of your Home component JSX, using 'username') ...
    <div className="home-container">
         <aside className="sidebar-home">
             <div className="profile-section">
                 <div className="profile-icon">
                     <img style={{ height: '30px' }} src="/cube2.svg" alt="" />
                 </div>
                 <span>{username || "Dummy Profile"}</span>
             </div>
             <nav className="menu">
                 <a href="/" className="menu-item active">Home</a>
                 <a href="/myfiles" className="menu-item">My Files</a>
                 <a href="/sharedwithme" className="menu-item">Shared with Me</a>
                 <a href="/community" className="menu-item">Community</a>
                 <a href="/tutorials" className="menu-item">Tutorials</a>
                 <a href="/library" className="menu-item">Library</a>
                 <a href="/inbox" className="menu-item">Inbox</a>
             </nav>
             <div className="upgrade-section">
                 <button className="upgrade-button">Upgrade</button>
                 <button className="upgrade-button" onClick={handleLogout} style={{marginTop:'10px'}}>
                    <FaSignOutAlt style={{marginRight: '5px'}}/>
                    Logout
                </button>
             </div>
         </aside>
         <main className="main-content">
             <header className="top-bar">
                 <h1>Welcome to the 3D space</h1>
                 <button className="import-button" onClick={handleImportButtonClick}>Import</button>
                 <button className="generate-button" onClick={handleGenerateButtonClick}>Generate</button>
             </header>

             {isImportPanelOpen && (
                 <div className="import-home">
                     <div className="import-panel-header">
                         <h2>Import or Drag & Drop</h2>
                         <FaTimes className="close-icon" onClick={handleClosePanel} />
                     </div>
                      <div
                         className={`drag-drop-area ${dragOver ? "drag-over" : ""}`}
                         onDragOver={handleDragOver}
                         onDragLeave={handleDragLeave}
                         onDrop={handleDrop}
                     >
                         <p>Drag & Drop files here or choose an option below</p>
                     </div>
                     <div className="import-options">
                         <button className="import-option" onClick={() => handleFileInput(".gltf,.glb,.stl,.fbx,.obj")}>3D Model (GLTF, STL, FBX, OBJ)</button>
                     </div>
                 </div>
             )}

             {isGeneratePanelOpen && (
                  <div className="import-panel">
                     <div className="import-panel-header">
                         <h2>Generate</h2>
                         <FaTimes className="close-icon" onClick={handleClosePanel} />
                     </div>
                     <div className="import-options">
                         <button className="import-option" onClick={() => navigate('/2dimageto3dmodel')}>2D Image to 3D Model</button>
                         <button className="import-option" onClick={() => navigate('/polymodel')}>Polymodel Conversion</button>
                         <button className="import-option" onClick={() => navigate('#')}>Dummy Button 1</button>
                         <button className="import-option" onClick={() => navigate('#')}>Dummy Button 2</button>
                         <button className="import-option" onClick={() => navigate('#')}>Dummy Button 3</button>
                     </div>
                 </div>
             )}

             <section className="projects">
                 <h2>Projects</h2>
                 <div className="projects-grid">
                      <div onClick={() => navigate('/editor')} className="project-card new-file"><FaFileAlt style={{ marginRight: "8px" }} />
                         <p>New File</p>
                     </div>
                     <div className="project-card">
                         <div onClick={() => navigate('/editor')} className="project-thumbnail"></div>
                         <p className="project-title">Untitled</p>
                         <span className="project-date"></span>
                         <p>3D Space</p>
                     </div>
                     <div className="project-card">
                         <div className="project-thumbnail"></div>
                         <p className="project-title">Mini Room - Art - Copy</p>
                         <span className="project-date"></span>
                         <p>3D Gummy Bear</p>
                     </div>
                     <div className="project-card">
                         <div className="project-thumbnail"></div>
                         <p className="project-title">3D icons</p>
                         <span className="project-date"></span>
                         <p>Packages</p>
                     </div>
                     <div className="project-card">
                          <div className="project-thumbnail"></div>
                         <p className="project-title">Untitled</p>
                         <span className="project-date"></span>
                         <p></p>
                     </div>
                 </div>
             </section>


             <section className="tutorials">
                 <h2>Tutorials</h2>
                 <div className="tutorials-grid">
                     <div className="tutorial-card">
                         <div className="project-thumbnail"></div>
                         <p className="project-title">Untitled</p>
                         <span className="project-date"></span>
                         <p></p>
                     </div>
                     <div className="tutorial-card">
                         <div className="project-thumbnail"></div>
                         <p className="project-title">Untitled</p>
                         <span className="project-date"></span>
                         <p></p>
                     </div>
                     <div className="tutorial-card">
                         <div className="project-thumbnail"></div>
                         <p className="project-title">Untitled</p>
                         <span className="project-date"></span>
                         <p></p>
                     </div>
                     <div className="tutorial-card">
                         <div className="project-thumbnail"></div>
                         <p className="project-title">Untitled</p>
                         <span className="project-date"></span>
                         <p></p>
                     </div>
                 </div>
             </section>
         </main>
     </div>
  );
};

export default Home;