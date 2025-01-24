import React, { useState } from "react";
import { FaTimes } from "react-icons/fa"; // Import close icon
import "./styles/home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [isImportPanelOpen, setImportPanelOpen] = useState(false);
  const [isGeneratePanelOpen, setGeneratePanelOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleImportButtonClick = () => {
    setImportPanelOpen(!isImportPanelOpen);
    setGeneratePanelOpen(false); // Close Generate panel if open
  };

  const handleGenerateButtonClick = () => {
    setGeneratePanelOpen(!isGeneratePanelOpen);
    setImportPanelOpen(false); // Close Import panel if open
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

  const handleFileInput = (acceptType) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = acceptType;
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log(`Selected file: ${file.name}`);
      }
    };
    input.click();
  };

  return (
    <div className="home-container">
      <aside className="sidebar-home">
        <div className="profile-section">
          <div className="profile-icon">
            <img  style={{height: '30px'}} src="/cube2.svg" alt="" />
          </div>
          <span>Dummy Profile</span>
        </div>
        <nav className="menu">
          <a href="/home" className="menu-item active">Home</a>
          <a href="/myfiles" className="menu-item">My Files</a>
          <a href="/sharedwithme" className="menu-item">Shared with Me</a>
          <a href="/community" className="menu-item">Community</a>
          <a href="/tutorials" className="menu-item">Tutorials</a>
          <a href="/library" className="menu-item">Library</a>
          <a href="/inbox" className="menu-item">Inbox</a>
        </nav>
        <div className="upgrade-section">
          <button className="upgrade-button">Upgrade</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="top-bar">
          <h1>Welcome to the 3D space</h1>
          <button className="import-button" onClick={handleImportButtonClick}>Import</button>
          <button className="generate-button" onClick={handleGenerateButtonClick}>Generate</button>
        </header>

        {isImportPanelOpen && (
          <div className="import-panel">
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
              <button className="import-option" onClick={() => handleFileInput("video/mp4")}>
                Video (MP4)
              </button>
              <button className="import-option" onClick={() => handleFileInput(".gltf,.glb,.stl,.fbx,.obj")}>
                3D Model (GLTF, STL, FBX, OBJ)
              </button>
              <button className="import-option" onClick={() => handleFileInput("audio/mpeg,audio/wav")}>
                Sound (MP3, WAV)
              </button>
              <button className="import-option" onClick={() => handleFileInput("image/svg+xml")}>
                Vector (SVG)
              </button>
              <button className="import-option" onClick={() => handleFileInput("image/jpeg,image/png")}>
                Image (JPG, PNG)
              </button>
              <button className="import-option" onClick={() => handleFileInput(".ply")}>
                Gaussian Splat (PLY)
              </button>
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
              <button
                className="import-option"
                onClick={() => navigate('/2dimageto3dmodel')}
              >
                2D Image to 3D Model
              </button>
              <button
                className="import-option"
                onClick={() => navigate('/polymodel')}
              >
                Polymodel Conversion
              </button>
              <button
                className="import-option"
                onClick={() => navigate('#')}
              >
                Dummy Button 1
              </button>
              <button
                className="import-option"
                onClick={() => navigate('#')}
              >
                Dummy Button 2
              </button>
              <button
                className="import-option"
                onClick={() => navigate('#')}
              >
                Dummy Button 3
              </button>
            </div>
          </div>
        )}

        <section className="projects">
          <h2>Projects</h2>
          <div className="projects-grid">
            {/* New File Dotted Frame */}
            <div onClick={() => navigate('/editor')} className="project-card new-file">
              <p>🗃️ New File</p>
            </div>
            {/* Existing Projects */}
            <div className="project-card">
              <div className="project-thumbnail"></div>
              <p className="project-title">Untitled</p>
              <span className="project-date">Edited 1 day ago</span>
              <p>3D Gummy Bear</p>
            </div>
            <div className="project-card">
              <div className="project-thumbnail pink"></div>
              <p className="project-title">Mini Room - Art - Copy</p>
              <span className="project-date">Edited 2 days ago</span>
              <p>3D Gummy Bear</p>
            </div>
            <div className="project-card">
              <div className="project-thumbnail"></div>
              <p className="project-title">Untitled</p>
              <span className="project-date">Edited 2 days ago</span>
              <p>3D Gummy Bear</p>
            </div>
            <div className="project-card">
              <div className="project-thumbnail pink"></div>
              <p className="project-title">Mini Room - Art - Copy</p>
              <span className="project-date">Edited 3 months ago</span>
              <p>3D Gummy Bear</p>
            </div>
          </div>
        </section>


        <section className="tutorials">
          <h2>Tutorials</h2>
          <div className="tutorials-grid">
            <div className="tutorial-card">
              <div className="project-thumbnail pink"></div>
              <p className="project-title">Room - Art - Copy</p>
              <span className="project-date">Edited 9 months ago</span>
              <p>3D Gummy Bear</p>
            </div>
            <div className="tutorial-card">
              <div className="project-thumbnail"></div>
              <p className="project-title">Room - Art - Copy</p>
              <span className="project-date">Edited 9 months ago</span>
              <p>3D Shape Blending</p>
            </div>
            <div className="tutorial-card">
              <div className="project-thumbnail pink"></div>
              <p className="project-title">Room - Art - Copy</p>
              <span className="project-date">Edited 9 months ago</span>
              <p>Making 3D Components</p>
            </div>
            <div className="tutorial-card">
              <div className="project-thumbnail"></div>
              <p className="project-title">Room - Art - Copy</p>
              <span className="project-date">Edited 9 months ago</span>
              <p>APIs & Webhooks</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
