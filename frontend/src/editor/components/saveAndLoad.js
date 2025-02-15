// saveAndLoad.js (Modified to send the File object)

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import pako from 'pako';


// Helper function to convert a file to Base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]); // Get Base64 data
        reader.onerror = reject;
    });
};

// Helper function to convert a Three.js texture/normal map to Base64
const textureToBase64 = (texture) => {
    if (!texture || !texture.image) {
        return null;
    }
    let canvas;
    if (texture.image instanceof HTMLCanvasElement) {
        canvas = texture.image;
    } else {
        canvas = document.createElement('canvas');
        canvas.width = texture.image.width;
        canvas.height = texture.image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(texture.image, 0, 0);
    }
    return canvas.toDataURL('image/png').split(',')[1]; // PNG for lossless
};
const saveScene = async (sceneObjects, sceneSettings, fileName) => {
  const dataToSave = {
    sceneSettings: { ...sceneSettings },
    objects: [],
  };

  for (const obj of sceneObjects) {
    const objectData = {
        id: obj.id,
        type: obj.type,
        displayId: obj.displayId,
        position: obj.position,
        rotation: obj.rotation,
        scale: obj.scale,
    };

    // --- Material Handling ---
    if (obj.material) {
        const mat = obj.material;
        objectData.material = {
            color: mat.color?.getHexString ? `#${mat.color.getHexString()}` : '#ffffff', //default color
            emissive: mat.emissive?.getHexString ? `#${mat.emissive.getHexString()}` : '#000000', //default
            metalness: mat.metalness ?? 0,  // Use nullish coalescing operator
            roughness: mat.roughness ?? 0.5,
            opacity: mat.opacity ?? 1,
            reflectivity: mat.reflectivity ?? 0,
            shininess: mat.shininess ?? 30,
            transmission: mat.transmission ?? 0,
            clearcoat: mat.clearcoat ?? 0,
            clearcoatRoughness: mat.clearcoatRoughness ?? 0,
            sheen: mat.sheen ?? 0,
            sheenRoughness: mat.sheenRoughness ?? 0,
            ior: mat.ior ?? 1.5,
            thickness: mat.thickness ?? 0,
            wireframe: mat.wireframe ?? false,
            flatShading: mat.flatShading ?? false,
            castShadow: mat.castShadow ?? false,
            receiveShadow: mat.receiveShadow ?? false,
            side: mat.side === THREE.FrontSide ? 'front' : mat.side === THREE.BackSide ? 'back' : 'double',
        };

        // Save texture and normal map (Base64)
        objectData.material.texture = await textureToBase64(obj.material.map);
        objectData.material.normalMap = await textureToBase64(obj.material.normalMap);
    }

    // --- Light-Specific Properties ---
    if (obj.type === 'pointLight' || obj.type === 'spotLight' || obj.type === 'directionalLight') {
        objectData.color = obj.color;
        objectData.intensity = obj.intensity;
         if (obj.type === 'spotLight') {
            objectData.angle = obj.angle;
            objectData.penumbra = obj.penumbra;
            objectData.distance = obj.distance;
            objectData.decay = obj.decay;
        }
        if (obj.type === 'spotLight' || obj.type === 'directionalLight') {
            objectData.target = obj.target;
        }
    }

     // --- Imported Object Handling ---
    if (obj.mesh && obj.mesh.userData && obj.mesh.userData.originalFile) {
        const originalFile = obj.mesh.userData.originalFile;
        objectData.originalFileName = originalFile.name;
        objectData.fileData = await fileToBase64(originalFile);
    }

    dataToSave.objects.push(objectData);
}
  const jsonString = JSON.stringify(dataToSave, null, 2);
  const compressed = pako.deflate(jsonString, { to: 'string' });
  const blob = new Blob([compressed], { type: 'application/octet-stream' });

  // --- Get username from session storage ---
  const sessionUsername = localStorage.getItem('username');
  

  if ( !sessionUsername) {
    alert("You must be logged in to save.");
    return; // Stop the save process
  }

  // --- Use FormData to send the file ---
  const formData = new FormData();
  formData.append('sceneName', fileName); // Add filename
  formData.append('username', sessionUsername); // Add username
  formData.append('sceneFile', blob, `${fileName}.artxthree`); // Add the file

  try {
    const response = await fetch('http://localhost:5050/save', {
      method: 'POST',
      body: formData, // Send the FormData object
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save scene: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Scene saved successfully:', responseData);

    if (responseData.message) {
      alert(responseData.message);
    }
    if (responseData.sceneId) {
      console.log('Scene ID:', responseData.sceneId);
    }

  } catch (error) {
    console.error('Error saving scene:', error);
    alert(`Error saving scene: ${error.message}`);
  }
};
const loadScene = async (file, setSceneObjects, setSceneSettings) => {
    try {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const compressed = event.target.result;
                const jsonString = pako.inflate(compressed, { to: 'string' });
                const loadedData = JSON.parse(jsonString);

                // --- Validate loaded data ---
                if (!loadedData.objects || typeof loadedData.objects[Symbol.iterator] !== 'function') {
                    console.error("Error loading .artxthree file: Invalid objects data.");
                    return;
                }
                if (!loadedData.sceneSettings) {
                    console.error("Error loading .artxthree file: Invalid sceneSettings data.");
                    return;
                }

                const newSceneObjects = [];

                for (const objData of loadedData.objects) {
                    const newObject = {
                        id: objData.id,
                        type: objData.type,
                        displayId: objData.displayId,
                        position: objData.position,
                        rotation: objData.rotation,
                        scale: objData.scale,
                    };
                    // --- Material Loading ---
                    if (objData.material) {
                        const mat = objData.material;
                        newObject.material = {
                            color: mat.color,
                            emissive: mat.emissive,
                            metalness: mat.metalness,
                            roughness: mat.roughness,
                            opacity: mat.opacity,
                            reflectivity: mat.reflectivity,
                            shininess: mat.shininess,
                            transmission: mat.transmission,
                            clearcoat: mat.clearcoat,
                            clearcoatRoughness: mat.clearcoatRoughness,
                            sheen: mat.sheen,
                            sheenRoughness: mat.sheenRoughness,
                            ior: mat.ior,
                            thickness: mat.thickness,
                            wireframe: mat.wireframe,
                            flatShading: mat.flatShading,
                            castShadow: mat.castShadow,
                            receiveShadow: mat.receiveShadow,
                             side: mat.side === 'front' ? THREE.FrontSide : mat.side === 'back' ? THREE.BackSide : THREE.DoubleSide,
                        };

                        // --- Load Texture ---
                        if (mat.texture) {
                            const textureLoader = new THREE.TextureLoader();
                            const textureData = `data:image/png;base64,${mat.texture}`;
                            newObject.material.map = textureLoader.load(textureData);
                        }
                        // --- Load Normal Map ---
                        if (mat.normalMap) {
                            const textureLoader = new THREE.TextureLoader();
                            const textureData = `data:image/png;base64,${mat.normalMap}`;
                            newObject.material.normalMap = textureLoader.load(textureData);
                        }
                    }

                    // --- Light Loading ---
                   if (objData.type === 'pointLight' || objData.type === 'spotLight' || objData.type === 'directionalLight') {
                        newObject.color = objData.color;
                        newObject.intensity = objData.intensity;
                         if (objData.type === 'spotLight') {
                            newObject.angle = objData.angle;
                            newObject.penumbra = objData.penumbra;
                            newObject.distance = objData.distance;
                            newObject.decay = objData.decay;
                        }
                        if (objData.type === 'spotLight' || objData.type === 'directionalLight') {
                            newObject.target = objData.target;
                        }
                    }

                    // --- Imported Object Loading ---
                    if (objData.fileData) {
                        const base64Data = objData.fileData;
                        const fileName = objData.originalFileName || 'imported_model';
                        const mimeType = getMimeType(fileName);
                        const dataURL = `data:${mimeType};base64,${base64Data}`;
                        const loader = getLoader(fileName);

                        if (!loader) {
                            console.error("Unsupported file type for", fileName);
                            continue;
                        }

                        const file = dataURLtoFile(dataURL, fileName);
                        //Crucial: store original File object.
                        newObject.mesh = { userData: { originalFile: file } };

                        loader.parse(
                            await fetch(dataURL).then(res => res.arrayBuffer()),
                            "",  // No path needed with data URLs
                            (loadedModel) => {
                                 let mesh;
                                if (loadedModel.scene) { //gltf/fbx
                                  mesh = loadedModel.scene;
                                } else { //obj stl
                                  mesh = loadedModel
                                }
                                newObject.mesh = mesh;
                                 //Important: restore File object for saving.
                                newObject.mesh.userData.originalFile = file;

                                newSceneObjects.push(newObject); // Push *after* load
                                 // Update scene *after* each object loads
                                setSceneObjects([...newSceneObjects]); // Use spread for immutability
                                setSceneSettings({ ...loadedData.sceneSettings }); // Use spread for immutability
                            },
                            (error) => {
                                console.error("Error loading imported model:", error);
                            }
                        );
                    }

                    // Only add if it's NOT an async-loaded object.
                    if (!objData.fileData) {
                        newSceneObjects.push(newObject);
                    }
                }

              // Set scene data if no objects need async loading.
              if(newSceneObjects.length > 0 && !loadedData.objects.some(obj => obj.fileData)) { //check if scene objects are more than 0
                setSceneObjects(newSceneObjects);
              }
                setSceneSettings({ ...loadedData.sceneSettings }); // Set scene settings

            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
            }
        };
        reader.readAsArrayBuffer(file); // Read as ArrayBuffer
    } catch (error) {
        console.error("Error loading .artxthree file:", error);
    }
};

// Helper: Get MIME type
const getMimeType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
        case 'gltf':
        case 'glb': return 'model/gltf+json';
        case 'obj': return 'text/plain';
        case 'fbx': return 'application/octet-stream';
        case 'stl': return 'application/sla';
        default: return 'application/octet-stream';
    }
};

// Helper: Get loader
const getLoader = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'gltf' || ext === 'glb') {
        const loader = new GLTFLoader();
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('/draco/');
		loader.setDRACOLoader(dracoLoader);
        return loader;
    } else if (ext === 'obj') {
        return new OBJLoader();
    } else if (ext === 'fbx') {
        return new FBXLoader();
    } else if (ext === 'stl') {
        return new STLLoader();
    }
    return null;
};

// Helper: dataURL to File object
function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

export { saveScene, loadScene };