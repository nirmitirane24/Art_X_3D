import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FBXLoader } from 'three-stdlib'; // Import FBXLoader from three-stdlib
import './styles/welcomepage.css';
import { useNavigate, Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaFacebook, FaTiktok, FaDiscord } from "react-icons/fa";

// Navbar Component with Dropdown
const Navbar = () => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = React.useState(null);

  const handleMouseEnter = (item) => setHoveredItem(item);
  const handleMouseLeave = () => setHoveredItem(null);

  const dropdownStyle = {
    position: 'absolute',
    top: '50px',
    left: '0',
    backgroundColor: '#1b1b1b',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    gap: '30px',
    zIndex: 1000,
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  return (
    <nav className="navbar" style={{ marginTop: '-30px', position: 'relative' }}>
      <Link to={'/'}>
        <img
          src="/cube2.svg"
          style={{
            height: '35px',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            marginTop: '5px',
          }}
        ></img>
      </Link>
      <ul className="navbar-menu">
      <li
          className="navbar-item"
          onMouseEnter={() => handleMouseEnter('product')}
          onMouseLeave={handleMouseLeave}
        >
          Product
          {hoveredItem === 'product' && (
            <div style={dropdownStyle}>
              <Link to="/features" style={linkStyle}>
                Features
              </Link>
              <Link to="/3dembeds" style={linkStyle}>
                3d Embeds
              </Link>
              <Link to="/x3d mirroring" style={linkStyle}>
                X3D mirroring
              </Link>
            </div>
          )}
        </li>
        <li
          className="navbar-item"
          onMouseEnter={() => handleMouseEnter('about')}
          onMouseLeave={handleMouseLeave}
        >
          About
          {hoveredItem === 'about' && (
            <div style={dropdownStyle}>
              <Link to="/resources" style={linkStyle}>
                Download
              </Link>
              <Link to="/tutorials" style={linkStyle}>
                Tutorials
              </Link>
              <Link to="/docs" style={linkStyle}>
                Docs
              </Link>
              <Link to="/examples" style={linkStyle}>
                Examples
              </Link>
            </div>
          )}
        </li>
        <li
          className="navbar-item"
          onMouseEnter={() => handleMouseEnter('community')}
          onMouseLeave={handleMouseLeave}
        >
          Community
          {hoveredItem === 'community' && (
            <div style={dropdownStyle}>
              <Link to="/forums" style={linkStyle}>
                Forums
              </Link>
              <Link to="/events" style={linkStyle}>
                Events
              </Link>
              <Link to="/groups" style={linkStyle}>
                Groups
              </Link>
            </div>
          )}
        </li>
        <li
          className="navbar-item"
          onMouseEnter={() => handleMouseEnter('resources')}
          onMouseLeave={handleMouseLeave}
        >
          Resources
          {hoveredItem === 'resources' && (
            <div style={dropdownStyle}>
              <Link to="/downloads" style={linkStyle}>
                Downloads
              </Link>
              <Link to="/tutorials" style={linkStyle}>
                Tutorials
              </Link>
              <Link to="/viewer" style={linkStyle}>
                Viewer
              </Link>
            </div>
          )}
        </li>
        <li  style={{backgroundColor: 'hsla(0, 0%, 100%, .05)', borderRadius: '15px'}} className="navbar-item" onClick={() => navigate('/login')}>
          Log In
        </li>
        <li style={{backgroundColor: 'hsla(0, 0%, 100%, .2)', borderRadius: '15px'}} className="navbar-item" onClick={() => navigate('/home')}>
          Get Started
        </li>
      </ul>
    </nav>
  );
};

// Plane Model Component (FBX Version)
const PlaneModel = () => {
  const fbx = useLoader(FBXLoader, '/3d/earth low poly.fbx'); // Path to your .fbx file
  const planeRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useFrame(() => {
    planeRef.current.rotation.x = mouseRef.current.y * Math.PI * 0.05 + Math.PI / 2;
    planeRef.current.rotation.y = mouseRef.current.x * Math.PI * 0.05;
  });

  return <primitive ref={planeRef} object={fbx} scale={[0.02, 0.02, 0.02]} castShadow />;
};

// Floor Component
const Floor = () => {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
      <planeGeometry args={[200, 200]} />
      <shadowMaterial opacity={4} />
    </mesh>
  );
};

// Main Welcome Page Component
const WelcomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="main-container" style={{ display: 'flex', height: '140vh', flexDirection: 'column' }}>
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className='features' style={{ marginTop: '90px' }}>
        <li>✓ web-based</li>
        <li>✓ real-time</li>
        <li>✓ interactive 3D</li>
      </div>

      <div className="content-container" style={{ display: 'flex', height: '50%' }}>
        {/* Overlay Text */}
        <div className="overlay" style={{ flex: 1, padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: "78px", letterSpacing: '1.8px' }}>Explore the World of 3D</h1>
          <p style={{ fontSize: "20px", opacity: "70%", fontFamily: "cursive", marginTop: '-50px' }}>ArtX3d, a place to design and generate 3D models.</p>
          <button className="welcomeBTN" style={{ fontSize: "30px", marginTop: '2px', padding: '10px 20px' }} onClick={() => navigate('/home')}>Start Here → </button>
        </div>

        {/* Canvas for 3D Model */}
        <div className="canvas-container" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Canvas
            className="canvas"
            shadows
            camera={{ position: [5, 5, 5], fov: 30 }}
          >
            {/* Lighting */}
            <ambientLight intensity={1} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2000}
              shadow-mapSize-height={2000}
            />

            {/* Plane model */}
            <PlaneModel />

            {/* Floor Plane */}
            <Floor />

            {/* Controls for Camera Movement */}
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const Footer = () => {
  const footerStyle = {
    backgroundColor: "#1a192d",
    color: "white",
    padding: "20px 50px",
    textAlign: "center",
    marginTop: "auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const linkStyle = {
    color: "#B3BFFF",
    textDecoration: "none",
    margin: "0 10px",
    fontSize: "24px", // Adjust size for icons
  };

  const footerLinksStyle = {
    marginBottom: "10px",
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  };

  return (
    <footer style={footerStyle}>
      <div style={footerLinksStyle}>
        <a href="/privacy" style={linkStyle}>
          Privacy Policy
        </a>
        <a href="/terms" style={linkStyle}>
          Terms of Service
        </a>
        <a href="/contact" style={linkStyle}>
          Contact Us
        </a>
      </div>
      <p style={{ fontSize: "14px", opacity: "0.7", margin: "10px 0" }}>
        &copy; {new Date().getFullYear()} ArtX3D. All rights reserved.
      </p>
      <div style={footerLinksStyle}>
        <a
          href="https://instagram.com"
          style={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram />
        </a>
        <a
          href="https://twitter.com"
          style={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTwitter />
        </a>
        <a
          href="https://facebook.com"
          style={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook />
        </a>
        <a
          href="https://tiktok.com"
          style={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTiktok />
        </a>
        <a
          href="https://discord.com"
          style={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaDiscord />
        </a>
      </div>
    </footer>
  );
};

export default WelcomePage;
