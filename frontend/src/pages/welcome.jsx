import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FBXLoader } from 'three-stdlib'; // Import FBXLoader from three-stdlib
import './styles/HomePage.css';
import { useNavigate, Link } from 'react-router-dom';

// Navbar Component
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="navbar" style={{marginTop: '-30px'}}>
      <Link to={'/'}><img src="/cube2.svg"style={{height: '30px', justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginTop: '5px'}}></img></Link>
      <ul className="navbar-menu">
        <li className="navbar-item">About</li>
        <li className="navbar-item">AI Tools</li>
      </ul>
      <div className="navbar-right">
        <button className="navbar-login" onClick={() => navigate('/profile')}>Profile</button>
        <button className="navbar-login" onClick={() => navigate('/login')}>Log In</button>
        <button className="navbar-get-started" onClick={() => navigate('/register')}>Get Started</button>
      </div>
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
      <div className='features' style={{marginTop: '90px'}}>
        <li>✓ web-based</li>
        <li>✓ real-time</li>
        <li>✓ interactive 3D</li>
      </div>

      <div className="content-container" style={{ display: 'flex', height: '50%' }}>
        {/* Overlay Text */}
        <div className="overlay" style={{ flex: 1, padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: "78px", letterSpacing: '1.8px' }}>Explore the World of 3D</h1>
          <p style={{ fontSize: "25px", opacity: "70%", fontFamily: "sans-serif", marginTop: '-50px'}}>Start the journey here...</p>
          <button className="welcomeBTN" style={{ fontSize: "30px", marginTop: '2px', padding: '10px 20px' }} onClick={() => navigate('/editor')}>Start Here → </button>
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
    </div>
  );
};

export default WelcomePage;
