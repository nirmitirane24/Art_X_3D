// src/components/CameraControls.jsx
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const CameraControls = ({ camera, enabled, selectedObjects }) => {
    const controlsRef = useRef();
    const { gl } = useThree();

    const orbitTarget = useRef(new THREE.Vector3()); // Target for orbit controls
    const panStart = useRef(new THREE.Vector3()); // For panning calculations

    useEffect(() => {
        const currentCamera = camera;
        const currentControls = controlsRef.current;

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
            currentControls.target.copy(orbitTarget.current);
        };
        if (currentControls) {
            currentControls.enabled = enabled;
            currentControls.enableRotate = enabled;
            currentControls.enableZoom = enabled;
            currentControls.enablePan = enabled;
            currentControls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.PAN,
                RIGHT: null, // Disable right-click
            };
            currentControls.touches = {
                ONE: THREE.TOUCH.ROTATE,
                TWO: null, // Disable two-finger touch
            };
        }
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [camera, enabled, selectedObjects]);

    // Update orbit controls target on each frame
    useFrame(() => {
        if (controlsRef.current) {
            controlsRef.current.target.copy(orbitTarget.current);
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            args={[camera, gl.domElement]}
            target={orbitTarget.current}
        />
    );
};

export default CameraControls;