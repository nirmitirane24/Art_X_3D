// --- components/CameraControls.jsx ---
import React, { useRef, useEffect, useContext } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

// Create the context for sharing scene-related data (like the camera)
export const SceneContext = React.createContext();

const CameraControls = ({ enabled, dampingFactor = 0.05, enableDamping = true }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const orbitTarget = useRef(new THREE.Vector3(0, 0, 0)); // Initialize target
  const targetLerp = useRef(new THREE.Vector3()); // For smooth target transitions

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enabled = enabled;
    controls.enableDamping = enableDamping;
    controls.dampingFactor = dampingFactor;
    controls.target.copy(orbitTarget.current); // Set initial target
    controlsRef.current = controls;

    return () => {
      controls.dispose();
    };
    // Only depend on enabled, dampingFactor, enableDamping.  NOT selectedObjects.
  }, [camera, gl, enabled, dampingFactor, enableDamping]);

  useEffect(() => {
    const currentCamera = camera;
    const onKeyDown = (event) => {
      if (!enabled) return; // Only handle keys if controls are enabled

      const panSpeed = 0.1;
      const zoomSpeed = 0.5;

      switch (event.key) {
        case 'w': // Move forward
        case 'ArrowUp':
          orbitTarget.current.add(new THREE.Vector3(0, 0, -panSpeed).applyQuaternion(currentCamera.quaternion));
          break;
        case 's': // Move backward
        case 'ArrowDown':
          orbitTarget.current.add(new THREE.Vector3(0, 0, panSpeed).applyQuaternion(currentCamera.quaternion));
          break;
        case 'a': // Move left
        case 'ArrowLeft':
          orbitTarget.current.add(new THREE.Vector3(-panSpeed, 0, 0).applyQuaternion(currentCamera.quaternion));
          break;
        case 'd': // Move right
        case 'ArrowRight':
          orbitTarget.current.add(new THREE.Vector3(panSpeed, 0, 0).applyQuaternion(currentCamera.quaternion));
          break;
        case '-': // Zoom out
          currentCamera.position.add(new THREE.Vector3(0, 0, zoomSpeed).applyQuaternion(currentCamera.quaternion));
          break;
        case '+': // Zoom in
          currentCamera.position.add(new THREE.Vector3(0, 0, -zoomSpeed).applyQuaternion(currentCamera.quaternion));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (controlsRef.current) {  // Check if controlsRef.current exists
          controlsRef.current.dispose();
      }
    };
  }, [camera, enabled, orbitTarget]); // Add orbitTarget to dependencies

  useFrame(() => {
    if (controlsRef.current && enabled) {
      // Smoothly interpolate the target position
      targetLerp.current.lerp(orbitTarget.current, dampingFactor);
      controlsRef.current.target.copy(targetLerp.current);
      controlsRef.current.update();
    }
  });

  // Provide the camera through the context
  return (
    <SceneContext.Provider value={{ camera }}>
      {/*  We don't need to render anything directly here */}
      {/*  The <orbitControls /> is implicitly created in the useEffect */}
    </SceneContext.Provider>
  );
};

export default CameraControls;