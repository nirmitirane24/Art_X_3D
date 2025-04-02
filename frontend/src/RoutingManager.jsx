import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import WelcomePage from './pages/welcome.jsx';
import EditorManager from './editor/editorManager.jsx';
import Home from './pages/home.jsx';
import ErrorPage from './pages/error.jsx';

function RoutingManager() {
  return (
    <Router>
      <Routes>
        <Route  path="/" element={<WelcomePage />} />
        <Route  path="/welcome" element={<WelcomePage />} />
        <Route  path="/login" element={<Login />} />
        <Route  path="/register" element={<Register />} />
        <Route  path="/home" element={<Home />} />
        <Route  path="/editor" element={<EditorManager />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default RoutingManager;
