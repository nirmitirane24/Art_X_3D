// --- START OF FILE LightComponent.jsx ---
import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TransformControls } from 'three-stdlib';

const LightComponent = ({ object, selectedObjects, sceneRef }) => {
    const lightRef = useRef();
    const helperRef = useRef();
    const targetRef = useRef();
    const transformControlsRef = useRef();
    const { camera, gl } = useThree();
    const [isDragging, setIsDragging] = useState(false);


    useEffect(() => {
        return () => {
           //cleanup logic
           // ... (cleanup logic as before)
            if (transformControlsRef.current) {
                transformControlsRef.current.detach();
                transformControlsRef.current.dispose();
                transformControlsRef.current = null;
            }

            if (helperRef.current) {
                if (helperRef.current.parent) {
                    helperRef.current.parent.remove(helperRef.current);
                }
                helperRef.current.dispose();
                helperRef.current = null;
            }

            if (targetRef.current) {
                if (targetRef.current.parent) {
                    targetRef.current.parent.remove(targetRef.current);
                }
                targetRef.current = null;
            }

            if (lightRef.current) {
                if (lightRef.current.parent) {
                    lightRef.current.parent.remove(lightRef.current);
                }
                if (lightRef.current.dispose) {
                    lightRef.current.dispose();
                }
                lightRef.current = null;
            }
        };
    }, [object.id, sceneRef]);

    useFrame(() => {
         //light creation and update logic
         // ... (light creation and update logic as before)
        if (!sceneRef.current) {
            console.warn("Scene ref is not yet available.");
            return;
        }
        let lightNeedsCreation = false;

        if (!lightRef.current) {
            console.log("Creating light instance for", object.displayId);
            lightNeedsCreation = true;
            let lightInstance;

            if (object.type === "pointLight") {
                lightInstance = new THREE.PointLight(object.color, object.intensity);
                lightInstance.castShadow = true;
            } else if (object.type === "spotLight") {
                lightInstance = new THREE.SpotLight(
                    object.color,
                    object.intensity,
                    object.distance,
                    object.angle,
                    object.penumbra,
                    object.decay
                );
                lightInstance.castShadow = true;
            } else if (object.type === "directionalLight") {
                lightInstance = new THREE.DirectionalLight(
                    object.color,
                    object.intensity
                );
                lightInstance.castShadow = true;
            }
            lightInstance.name = object.displayId;
            lightRef.current = lightInstance;
            sceneRef.current.add(lightRef.current);
        }

        if (
            lightNeedsCreation &&
            (object.type === "spotLight" || object.type === "directionalLight")
        ) {
            if (!targetRef.current) {
                const targetObject = new THREE.Object3D();
                targetRef.current = targetObject;
                sceneRef.current.add(targetRef.current);
                lightRef.current.target = targetRef.current;
                targetRef.current.name = `target-${object.id}`;
            }
        }

        if (lightRef.current && !isDragging) {
            if (object.position) {
                lightRef.current.position.fromArray(object.position);
            }

            if (object.type === "spotLight" || object.type === "directionalLight") {
                if (targetRef.current && object.target) {
                    targetRef.current.position.fromArray(object.target);
                }
                lightRef.current.target.updateMatrixWorld();

            }

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


        if (selectedObjects.includes(object.id) && lightRef.current) {
             //helper and transform controls logic
             // ... (helper and transform controls logic as before, but NO selection logic)
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

                if (helper) {
                    helper.name = `helper-${object.id}`;
                    sceneRef.current.add(helper);
                    helperRef.current = helper;
                }
            }

            if (!transformControlsRef.current) {
                console.log("Creating TransformControls for", object.displayId);
                const controls = new TransformControls(camera, gl.domElement);
                controls.attach(lightRef.current);
                sceneRef.current.add(controls);
                transformControlsRef.current = controls;

                controls.addEventListener('dragging-changed', (event) => {
                    setIsDragging(event.value);

                     if (!event.value) {
                        if (lightRef.current) {
                            object.position = [lightRef.current.position.x, lightRef.current.position.y, lightRef.current.position.z];
                        }
                        if (targetRef.current) {
                            object.target = [targetRef.current.position.x, targetRef.current.position.y, targetRef.current.position.z];
                        }
                      }
                });

                 controls.addEventListener('objectChange', () => {
                    if (isDragging && lightRef.current) {
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

            if (helperRef.current) {
                helperRef.current.update();
            }
        }  else {
            if (transformControlsRef.current) {
                transformControlsRef.current.detach();
                sceneRef.current.remove(transformControlsRef.current);
                transformControlsRef.current.dispose();
                transformControlsRef.current = null;
            }
            if (helperRef.current) {
                console.log("Removing helper for", object.displayId);
                if (helperRef.current.parent) {
                    helperRef.current.parent.remove(helperRef.current);
                }
                helperRef.current.dispose();
                helperRef.current = null;
            }
        }
    });

    return null;
};

export default LightComponent;