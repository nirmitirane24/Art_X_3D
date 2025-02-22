import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FBXLoader } from 'three-stdlib';
import './styles/welcomepage.css';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingPage from './loading';
import torus from '../assets/torus.png';
import textureimage from '../assets/textureimage.png';
import aichatbot from '../assets/chatbot.png';
import keyshortcuts from '../assets/keyshortcuts.png';
import folder from '../assets/folder.png';
import threedmodel from '../assets/3dmodel.png';
import camera from '../assets/camera.png';
import model from '../assets/model.png';
import animation from '../assets/animation.png';

// Navbar (no changes needed here)
const Navbar = ({ isAuthenticated }) => {
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
    <nav className="navbar" style={{ marginTop: '30px', position: 'relative', fontFamily: "Futura, 'Trebuchet MS', Arial, sans-serif" }}>
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
        {!isAuthenticated && (
          <li style={{ backgroundColor: 'hsla(0, 0%, 100%, .05)', borderRadius: '15px' }} className="navbar-item" onClick={() => navigate('/login')}>
            Log In
          </li>
        )}
        <li style={{ backgroundColor: 'hsla(0, 0%, 100%, .2)', borderRadius: '15px' }} className="navbar-item" onClick={() => navigate('/home')}>
          Get Started
        </li>
      </ul>
    </nav>
  );
};

// PlaneModel and Floor (no changes needed)
const PlaneModel = () => {
  const fbx = useLoader(FBXLoader, '/3d/earth low poly.fbx');
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

const Floor = () => {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
      <planeGeometry args={[200, 200]} />
      <shadowMaterial opacity={4} />
    </mesh>
  );
};

// WelcomePage (with the crucial change)
const WelcomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated === false) {
        try {
          await axios.get("http://localhost:5050/user/logs", { withCredentials: true });
          setIsAuthenticated(true);
        } catch (error) {
          setIsAuthenticated(false);
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }

    };
    checkAuth();
  }, [isAuthenticated]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="main-container" style={{ display: 'flex', minHeight: '250vh', flexDirection: 'column' }}>
      <Navbar isAuthenticated={isAuthenticated} />

      <div className='features' style={{ marginTop: '30px' }}>
        <li>✓ web-based</li>
        <li>✓ real-time</li>
        <li>✓ interactive 3D</li>
      </div>

      <div className="content-container" style={{ display: 'flex', height: '70vh' }}>
        <div className="overlay" style={{ flex: 1, padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: "78px", letterSpacing: '1.8px' }}>Explore the World of 3D</h1>
          <p style={{ fontSize: "20px", opacity: "70%", fontFamily: "Futura, 'Trebuchet MS', Arial, sans-serif", marginTop: '-50px' }}>ArtX3d, a place to design and generate 3D models.</p>
          <button className="welcomeBTN" style={{ fontSize: "30px", marginTop: '2px', padding: '10px 20px' }} onClick={handleGetStarted}>Start Here → </button>
        </div>

        <div className="canvas-container" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Canvas className="canvas" shadows camera={{ position: [5, 5, 5], fov: 30 }}>
            <ambientLight intensity={1} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow shadow-mapSize-width={2000} shadow-mapSize-height={2000} />
            <PlaneModel />
            <Floor />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>
      </div>

      <div className="tools-section">
        <h2 className="tools-title">Features to express your creativity in 3D</h2>

        <div className="tools-grid">
          <div className="tool-card">
            <img src={torus} alt="" />
            <h2>3D Modeling</h2>
            <p>Parametric objects, sculpting, welding, and more</p>
          </div>
          <div className="tool-card">
            <img src={textureimage} alt="" />
            <h2>Textures</h2>
            <p>Realistic textures and more</p>
          </div>
          <div className="tool-card">
            <img src={model} alt="" />
            <h2>Material Layers</h2>
            <p>Fine-tune the look of your models</p>
          </div>
          <div className="tool-card">
            <img src={animation} alt="" />
            <h2>Animations</h2>
            <p>Give life to your 3d objects</p>
          </div>
          <div className="tool-card">
            <img src={keyshortcuts} alt="" />
            <h2>User-friendly controls</h2>
            <p>A well structured keyboard shortcuts</p>
          </div>
          <div className="tool-card">
            <img src={aichatbot} alt="" />
            <h2>AI chat assistant</h2>
            <p>Real-time guidance</p>
          </div>
        </div>
      </div>

      <div className="more-section">
        <h2 className="more-title">And there is more!</h2>

        <div className="more-grid">
          <div className="more-card">
            <img src={folder} alt="" />
            <h3>Projects & Folders</h3>
          </div>
          <div className="more-card">
            <img src={threedmodel} alt="" />
            <h3>Multiple 3D export formats</h3>
          </div>
          <div className="more-card">
            <img src={camera} alt="" />
            <h3>Camera Controls</h3>
          </div>
        </div>
      </div>
    </div>
  );
};


export default WelcomePage;