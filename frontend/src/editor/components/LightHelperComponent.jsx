import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

const LightHelperComponent = ({ lightType, lightObject, scene }) => {
    const helperRef = useRef();
    const { gl } = useThree();

    useEffect(() => {
        let helper;
        const light = lightObject; // Use lightObject directly

        if (lightType === 'pointLight') {
            helper = new THREE.PointLightHelper(light, 10);
        } else if (lightType === 'spotLight') {
            helper = new THREE.SpotLightHelper(light);
        } else if (lightType === 'directionalLight') {
            helper = new THREE.DirectionalLightHelper(light);
        }

        if (helper) {
            helper.name = `helper-${lightObject.id}`;
            scene.add(helper);
            helperRef.current = helper;
        }

        return () => {
            if (helperRef.current) {
                scene.remove(helperRef.current);
            }
        };
    }, [lightType, lightObject, scene]);

    useEffect(() => {
        if (helperRef.current) {
            helperRef.current.update();
        }
    }, [lightObject, scene]);

    return null;
};

export default LightHelperComponent;
