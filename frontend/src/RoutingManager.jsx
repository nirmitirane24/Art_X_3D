import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import WelcomePage from './pages/welcome.jsx';
import EditorManager from './editor/editorManager.jsx';
import Home from './pages/home.jsx';


function RoutingManager() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<WelcomePage />} />
        <Route exact path="/register" element={< Register />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/home" element={<Home />} />
        <Route exact path="/editor" element={<EditorManager />} />
      </Routes>
    </Router>
  );
}



export default RoutingManager;