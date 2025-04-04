import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RoutingManager from './RoutingManager.jsx'
import { HelmetProvider } from 'react-helmet-async';
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider> 
      <RoutingManager />
    </HelmetProvider>
  </StrictMode>
);
