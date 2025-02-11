import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

const CameraControls = ({ enabled, dampingFactor = 0.05, enableDamping = true }) => { // Removed selectedObjects
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const orbitTarget = useRef(new THREE.Vector3(0, 0, 0)); // Initialize to origin or your desired default
    const targetLerp = useRef(new THREE.Vector3()); // Smooth target

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enabled = enabled;
    controls.enableDamping = enableDamping;
    controls.dampingFactor = dampingFactor;
    controls.target.copy(orbitTarget.current)

    controlsRef.current = controls;

    return () => {
      controls.dispose();
    };
      // Only depend on enabled, dampingFactor, enableDamping.  NOT selectedObjects.
  }, [camera, gl, enabled, dampingFactor, enableDamping]);

  useEffect(() => {
    const currentCamera = camera;
        const onKeyDown = (event) => {
            if (!enabled) return;

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
                case '-': // Zoom out (key: -)
                    currentCamera.position.add(new THREE.Vector3(0, 0, zoomSpeed).applyQuaternion(currentCamera.quaternion));
                    break;
                case '+': // Zoom in (key: +)
                    currentCamera.position.add(new THREE.Vector3(0, 0, -zoomSpeed).applyQuaternion(currentCamera.quaternion));
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            if (controlsRef.current) {
                controlsRef.current.dispose();
            }
        };
  }, [camera, enabled, orbitTarget]);

    useFrame(() => {
    if (controlsRef.current && enabled) {
      // Lerp the target position for smooth movement
      targetLerp.current.lerp(orbitTarget.current, dampingFactor); // Use dampingFactor here too
      controlsRef.current.target.copy(targetLerp.current);
      controlsRef.current.update();
    }
  });

  return null;
};

export default CameraControls;