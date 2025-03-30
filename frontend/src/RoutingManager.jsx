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
        <Route exact path="/" element={<WelcomePage />} />
        <Route exact path="/welcome" element={<WelcomePage />} />
        <Route exact path="/register" element={<Register />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/home" element={<Home />} />
        <Route exact path="/editor" element={<EditorManager />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default RoutingManager;
