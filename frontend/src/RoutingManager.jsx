import React from 'react';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import WelcomePage from './pages/welcome.jsx';
import EditorManager from './editor/editorManager.jsx';
import Home from './pages/home.jsx';
import ErrorPage from './pages/error.jsx';
import UpgradePage from './pages/UpgradePage.jsx';
import TermsAndConditions from './pages/Footer/TandC.jsx';
import PrivacyPolicy from './pages/Footer/PrivacyPolicy.jsx';
import ContactUs from './pages/Footer/ContactUs.jsx';
import ShippingAndDelivery from './pages/Footer/ShippingAndDelivery.jsx';
import CancellationAndRefund from './pages/Footer/CancellationAndRefund.jsx';


function RoutingManager() {
  const [subscriptionLevel, setSubscriptionLevel] = useState("free"); 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} /> 
        <Route path="/upgrade" element={<UpgradePage subscriptionLevel={subscriptionLevel} setSubscriptionLevel={setSubscriptionLevel} />} />
        <Route  path="/welcome" element={<WelcomePage />} />
        <Route  path="/login" element={<Login />} />
        <Route  path="/register" element={<Register />} />
        <Route  path="/home"element={<Home subscriptionLevel={subscriptionLevel} setSubscriptionLevel={setSubscriptionLevel} />} />
        <Route  path="/editor" element={<EditorManager />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage />} />

        {/* Footer Pages */}
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/shipping-and-delivery" element={<ShippingAndDelivery />} />
        <Route path="/cancellation-and-refund" element={<CancellationAndRefund />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        
      </Routes>
    </Router>
  );
}

export default RoutingManager;
