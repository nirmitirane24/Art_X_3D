import React  from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import WelcomePage from './pages/welcome.jsx';
import EditorManager from './editor/editorManager.jsx';

function RoutingManager() {
  return (
    <Router>
        <Routes>
        <Route exact path="/login" element={<Login/>} />
        <Route exact path="/" element={<WelcomePage/>} />
        <Route exact path="/register" element={< Register/>} /> 
        <Route exact path="/editor" element={<EditorManager />} />
        </Routes>
    </Router>
  );
}



export default RoutingManager;