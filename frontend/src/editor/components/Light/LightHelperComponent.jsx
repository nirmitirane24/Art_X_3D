// --- START OF FILE LightComponent.jsx ---

import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TransformControls } from 'three-stdlib';

const LightComponent = ({ object, selectedObjects, sceneRef, setCameraEnabled }) => {
    const lightRef = useRef();
    const helperRef = useRef();
    const targetRef = useRef();  // Ref for the target object
    const transformControlsRef = useRef();
    const { camera, gl } = useThree();
    const [isDragging, setIsDragging] = useState(false);

     useEffect(() => {
        // Cleanup function to remove the light, helper, and controls
        return () => {
            console.log("Cleaning up LightComponent", object.id);

             if (transformControlsRef.current) {
                transformControlsRef.current.detach();  // Detach from the light
                transformControlsRef.current.dispose(); // Dispose of resources
                transformControlsRef.current = null;
            }

            // Remove helper
            if (helperRef.current) {
                if (helperRef.current.parent) {
                    helperRef.current.parent.remove(helperRef.current);
                }
                helperRef.current.dispose(); // Dispose helper resources
                helperRef.current = null;
            }

            if (targetRef.current) {  // Check if targetRef exists
                if (targetRef.current.parent) {
                    targetRef.current.parent.remove(targetRef.current);
                }
              // No dispose method for Object3D
                targetRef.current = null;
            }

            // Remove the light from the scene
            if (lightRef.current) {
                if (lightRef.current.parent) {
                    lightRef.current.parent.remove(lightRef.current);
                }
                if (lightRef.current.dispose) {
                    lightRef.current.dispose(); // Dispose of light resources, if available
                }
                lightRef.current = null;
            }
        };
    }, [object.id, sceneRef]); // Depend on object.id and sceneRef


    useFrame(() => {
        if (!sceneRef.current) {
            console.warn("Scene ref is not yet available.");
            return;  // Exit if sceneRef is not ready
        }
        let lightNeedsCreation = false;

        // --- Light Creation (only if it doesn't exist) ---
        if (!lightRef.current) {
             console.log("Creating light instance for", object.displayId);
            lightNeedsCreation = true; // Set flag
            let lightInstance;

            // Create the appropriate light type
            if (object.type === "pointLight") {
                lightInstance = new THREE.PointLight(object.color, object.intensity);
                 lightInstance.castShadow = true; // Enable shadows for point light
            } else if (object.type === "spotLight") {
                lightInstance = new THREE.SpotLight(object.color, object.intensity, object.distance, object.angle, object.penumbra, object.decay);
                lightInstance.castShadow = true; // Enable shadows for spot light
            } else if (object.type === "directionalLight") {
                lightInstance = new THREE.DirectionalLight(object.color, object.intensity);
                lightInstance.castShadow = true;
            }
             lightInstance.name = object.displayId; // Set the name for identification
            lightRef.current = lightInstance;
            sceneRef.current.add(lightRef.current);
        }

         if (lightNeedsCreation && (object.type === "spotLight" || object.type === "directionalLight")) {
            if (!targetRef.current) {
                const targetObject = new THREE.Object3D();
                targetRef.current = targetObject;
                sceneRef.current.add(targetRef.current); // Add target to the scene
                lightRef.current.target = targetRef.current;  // Set the light's target
                 targetRef.current.name = `target-${object.id}`
            }
        }

        // --- Light Updates (within useFrame) ---
        if (lightRef.current && !isDragging) { // Only update position if NOT dragging

            if(object.position){
                lightRef.current.position.fromArray(object.position);
            }

            if (object.type === "spotLight" || object.type === "directionalLight") {
                if (targetRef.current && object.target) { //check target exist
                    targetRef.current.position.fromArray(object.target); // Update target position
                }
                lightRef.current.target.updateMatrixWorld();  // Important for directional/spot lights

            }


            // Update properties (color, intensity, etc.)
            if (object.color) {
                lightRef.current.color.set(object.color);
            }
            lightRef.current.intensity = object.intensity;

            if (object.type === "spotLight") {
                lightRef.current.angle = object.angle;
                lightRef.current.penumbra = object.penumbra;
                lightRef.current.distance = object.distance;
                lightRef.current.decay = object.decay;
            }
        }

        // --- Helper and TransformControls Logic (within useFrame) ---
        if (selectedObjects.includes(object.id) && lightRef.current) { // Only if selected
            if (!helperRef.current) {
                 console.log("Creating helper for", object.displayId);
                let helper;
                if (object.type === "pointLight") {
                    helper = new THREE.PointLightHelper(lightRef.current, 1);
                } else if (object.type === "spotLight") {
                    helper = new THREE.SpotLightHelper(lightRef.current);
                } else if (object.type === "directionalLight") {
                    helper = new THREE.DirectionalLightHelper(lightRef.current);
                }

                if(helper){
                    helper.name = `helper-${object.id}`;
                    sceneRef.current.add(helper);
                    helperRef.current = helper;
                }
            }


            if (!transformControlsRef.current) {
                console.log("Creating TransformControls for", object.displayId);
                const controls = new TransformControls(camera, gl.domElement);
                controls.attach(lightRef.current);  // Attach to the light
                sceneRef.current.add(controls); // Add controls to the scene
                transformControlsRef.current = controls;

                // --- Event Listeners (Simplified) ---
                controls.addEventListener('dragging-changed', (event) => {
                    setIsDragging(event.value);
                    setCameraEnabled(!event.value); // Disable/Enable here.

                     if (!event.value) { // Dragging stopped: update properties
                        if(lightRef.current){
                            object.position = [lightRef.current.position.x, lightRef.current.position.y, lightRef.current.position.z];
                        }
                        if(targetRef.current){
                           object.target = [targetRef.current.position.x, targetRef.current.position.y, targetRef.current.position.z];
                        }

                      }
                });

                controls.addEventListener('objectChange', () => { //listen for object
                    if (isDragging && lightRef.current) { // Update values while dragging
                      object.position = [
                        lightRef.current.position.x,
                        lightRef.current.position.y,
                        lightRef.current.position.z,
                      ];
                      if (targetRef.current) {
                        object.target = [
                          targetRef.current.position.x,
                          targetRef.current.position.y,
                          targetRef.current.position.z,
                        ];
                      }
                    }
                });


            }

            // Update the helper each frame
            if (helperRef.current) {
                helperRef.current.update();
            }
        } else {  // If NOT selected:
            // Clean up TransformControls if they exist
            if (transformControlsRef.current) {
                transformControlsRef.current.detach();       // Detach
                sceneRef.current.remove(transformControlsRef.current); // Remove from scene
                transformControlsRef.current.dispose();    // Dispose of resources
                transformControlsRef.current = null;
            }

            // Clean up helper if it exists
            if (helperRef.current) {
                 console.log("Removing helper for", object.displayId);
                if (helperRef.current.parent) {
                    helperRef.current.parent.remove(helperRef.current); // Remove from scene
                }
                helperRef.current.dispose();   // Dispose of resources
                helperRef.current = null;
            }
        }
    });

    return null; // This component doesn't render anything directly
};

export default LightComponent;