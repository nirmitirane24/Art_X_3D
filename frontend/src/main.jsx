import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RoutingManager from './RoutingManager.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RoutingManager />
  </StrictMode>
)
