import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FBXLoader } from 'three-stdlib';
import './styles/welcomepage.css'; 
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingPage from './loading';
import { TypeAnimation } from 'react-type-animation';
import { analytics, app } from "../analytics/firebaseAnalyze.js";
import { logEvent } from "firebase/analytics";
import { useLocation } from "react-router-dom";
import handleButtonClick from "../analytics/ButtonClickAnalytics.js"; 

// Navbar Component
const Navbar = ({ isAuthenticated, scrollToFooter, scrollToProductSection }) => {
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);

    const handleMouseEnter = (item) => setHoveredItem(item);
    const handleMouseLeave = () => setHoveredItem(null);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    
    return (
        <nav className="navbar">
            <Link to={'/'}>
                <img
                    src="/3d/1logo.png"
                    style={{
                        height: '60px',
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                        marginTop: '5px',
                    }}
                    alt="Logo"
                />
            </Link>
            <ul className="navbar-menu">
                <li
                    className="navbar-item"
                    onMouseEnter={() => handleMouseEnter('product')}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => {
                        handleButtonClick("Product Button", "User Clicked Product Button", "Navbar");
                        scrollToProductSection();
                    }} // Combined onClick handlers
                >
                    Product
                </li>
                <li
                    className="navbar-item"
                    onMouseEnter={() => handleMouseEnter('about')}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => {
                        handleButtonClick("About Button", "User Clicked About Button", "Navbar");
                        scrollToFooter();
                    }} 
                >
                    About
                </li>
                {!isAuthenticated && (
                    <li
                        className="navbar-item navbar-login-button"
                        onClick={() => {
                            handleButtonClick("Login Button", "User Clicked Login Button", "Welcome Page");
                            navigate('/login');
                        }} 
                    >
                        Log In
                    </li>
                )}
                <li
                    className="navbar-item navbar-get-started-button"
                    onClick={() => {
                        handleButtonClick("Get Started Button", "User Clicked Get Started Button", "Navbar");
                        navigate('/home');
                    }} 
                >
                    Get Started
                </li>
            </ul>
        </nav>
    );
};

// PlaneModel Component
const PlaneModel = () => {
    const fbx = useLoader(FBXLoader, '/3d/earth_welcomepage.fbx');
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

// WelcomePage Component
const WelcomePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const footerRef = useRef(null);
    const productSectionRef = useRef(null); // Ref for Quantum Computing Section
    const location = useLocation();

    // Get the current location and analytics instance
    useEffect(() => {
        if (analytics) {
        logEvent(analytics, "Welcome Page View", {
            page_location: location.pathname,
            page_title: document.title 
        });
        } else {
        console.warn("Analytics not initialized, page view event not logged.");
        }
    }, [location, analytics]); 

    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated === false) {
                try {
                    await axios.get(`${API_BASE_URL}/user/logs`, { withCredentials: true });
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
            handleButtonClick("Login Button", "User Clicked Login Button", "Welcome Page"); 
            navigate('/login');
            
        }
    };

    const scrollToFooter = () => {
        if (footerRef.current) {
            footerRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    const scrollToProductSection = () => {
        if (productSectionRef.current) {
            productSectionRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };


    if (loading) {
        return <LoadingPage />;
    }

    return (
        <div className="main-container">
            <Navbar
                isAuthenticated={isAuthenticated}
                scrollToFooter={scrollToFooter}
                scrollToProductSection={scrollToProductSection} // Pass the new function
            />

            <div className="content-container">
                <div className="overlay">
                    <h1>Explore the World of 3D</h1>
                    <p>ArtX3d, a place to design and generate 3D models.</p>
                    <button className="welcomeBTN" onClick={handleGetStarted}>Start Here → </button>
                    <div className="scroll-down-arrow"></div>
                </div>

                <div className="canvas-container" >
                    <Canvas className="canvas" shadows camera={{ position: [5, 5, 5], fov: 30 }}>
                        <ambientLight intensity={1} />
                        <directionalLight position={[5, 5, 5]} intensity={1} castShadow shadow-mapSize-width={2000} shadow-mapSize-height={2000} />
                        <PlaneModel />
                        <Floor />
                        <OrbitControls enableZoom={false} />
                    </Canvas>
                </div>
            </div>

            <br></br>
            <br></br>

            {/* New Tiles/Divs (Based on screenshots) */}
            <div className="ai-trading-section">
                <div className="trading-tile empty"></div>
                <div className="trading-tile">
                    <h2>Effortless 3D Modeling</h2>
                    <p>Our user-friendly interface is designed for all skill levels, from beginners to experienced designers. Start creating in minutes.</p>
                    <span><img src="./3d/cubee.png" className="trading-icon" alt="Cubee Icon" /></span>
                </div>
                <div className="trading-tile">
                    <h2>Real-Time Magic</h2>
                    <p>Experience smooth, real-time rendering. Modify your models and see the results immediately, without lag or delays.</p>
                    <span><img src="./3d/3d_sphere.png" className="trading-icon" alt="3D Sphere Icon" /></span>
                </div>
                <div className="trading-tile">
                    <h2>Bring Your Models to Life</h2>
                    <p>Customize the look of your creations with our powerful material editor. Control color, textures, reflectivity, and more.</p>
                    <span><img src="./3d/custo.png" className="trading-icon" alt="Custo Icon" /></span>
                </div>
                <div className="trading-tile">
                    <h2>Seamless Import & Export</h2>
                    <p>Work with your existing 3D models. Import and export in popular formats like GLTF, OBJ, and FBX.</p>
                    <span><img src="./3d/imex.png" className="trading-icon" alt="Imex Icon" /></span>
                </div>
                <div className="trading-tile empty"></div>
            </div>

            {/* New Section - Quantum Computing */}
            <div className="quantum-computing-section" ref={productSectionRef}>
                <div className="quantum-tile">
                    <span className="quantum-number">
                        <img src="./3d/ai_3d.png" className="quantum-icon" alt="AI 3D Icon" />
                    </span>
                    <h2 className="quantum-title">AI-Powered Assistance</h2>
                    <p className="quantum-description">Our built-in AI assistant provides real-time guidance and answers your questions, making 3D modeling even easier</p>
                </div>
                <div className="quantum-tile">
                    <span className="quantum-number">
                        <img src="./3d/book.png" className="quantum-icon" alt="Book Icon" />
                    </span>
                    <h2 className="quantum-title">Your Personal 3D Library</h2>
                    <p className="quantum-description">Manage your 3D models in your personal library. Easily find and reuse your assets across projects</p>
                </div>
                <div className="quantum-tile">
                    <span className="quantum-number">
                        <img src="./3d/3dtexture.png" className="quantum-icon" alt="3D Texture Icon" />
                    </span>
                    <h2 className="quantum-title">Empower student in 3D design</h2>
                    <p className="quantum-description">Quantum computers analyze vast datasets and enable real-time decisions.Works best for education, easy to use and can work on any system</p>
                </div>
                <div className="quantum-tile">
                    <span className="quantum-number">
                        <img src="./3d/cloud_3d.png" className="quantum-icon" alt="Cloud 3D Icon" />
                    </span>
                    <h2 className="quantum-title">Design in 3D, Anywhere</h2>
                    <p className="quantum-description">Work on your 3D projects from any device with a web browser. No downloads or installations required. Your creativity, unleashed.</p>
                </div>
            </div>

            {/* New Footer Section */}
            <div className="footer-section" ref={footerRef}>
                <h1 className="footer-title">
                    <TypeAnimation
                        sequence={[
                            'Your 3D World',
                            1000,
                            'Your 3D World Is One Step',
                            1000,
                            'Your 3D World Is One Step Away!',
                            1000,
                        ]}
                        speed={50}
                        style={{ fontSize: '50px', fontWeight: 'bold' }}
                        repeat={Infinity}
                    />
                </h1>

                <button className="lets-start-button" onClick={() => navigate('/login')}>Let's start</button>
                <p>ArtX3d, a place to design and generate 3D models.</p>

                <div className="email-buttons">
                    {/* <button className="email-button" onClick={() => window.location = 'mailto:patilpranav616@gmail.com'}>
                        <span className="quantum-number">
                            <img src="./3d/email-removebg-preview.png" className="email-icon" alt="Email Icon" />
                        </span>
                    </button> */}
                    {/* <button className="email-button" onClick={() => window.location = 'mailto:ranenirmiti24@gmail.com'}>
                        <span className="quantum-number">
                            <img src="./3d/email-removebg-preview.png" className="email-icon" alt="Email Icon" />
                        </span>
                    </button>
                    <button className="email-button" onClick={() => window.location = 'mailto:aniketvm1104@gmail.com'}>
                        <span className="quantum-number">
                            <img src="./3d/email-removebg-preview.png" className="email-icon" alt="Email Icon" />
                        </span>
                    </button> */}
                    <button className="footer-buttons" onClick={() => navigate('/contact-us')}>Contact Us</button>
                    <button className="footer-buttons" onClick={() => navigate('/terms-and-conditions')}>terms and Conditions</button>
                    <button className="footer-buttons" onClick={() => navigate('/privacy-policy')}>Privacy Policy</button>
                    <button className="footer-buttons" onClick={() => navigate('/shipping-and-delivery')}>Shipping and Delivery</button>
                    <button className="footer-buttons" onClick={() => navigate('/cancellation-and-refund')}>Cancellation and Refund</button>
                    
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;