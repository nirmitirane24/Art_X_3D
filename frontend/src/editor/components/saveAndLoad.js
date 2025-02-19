// --- saveAndLoad.js ---

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import axios from "axios";

const textureToBase64 = (texture) => {
  if (!texture || !texture.image) {
    return null;
  }
  let canvas;
  if (texture.image instanceof HTMLCanvasElement) {
    canvas = texture.image;
  } else {
    canvas = document.createElement("canvas");
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(texture.image, 0, 0);
  }
  return canvas.toDataURL("image/png").split(",")[1];
};

const saveScene = async (sceneObjects, sceneSettings, sceneName, sceneId) => { //added sceneId
    // const navigate = useNavigate();
  const dataToSave = {
    sceneSettings: { ...sceneSettings },
    objects: [],
    sceneId: sceneId || null, // Include sceneId (null if new scene)
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
        color:
          typeof mat.color === "string"
            ? mat.color
            : mat.color?.getHexString
            ? `#${mat.color.getHexString()}`
            : "#ffffff", // Handle string colors
        emissive:
          typeof mat.emissive === "string"
            ? mat.emissive
            : mat.emissive?.getHexString
            ? `#${mat.emissive.getHexString()}`
            : "#000000", // Handle string colors
        metalness: mat.metalness ?? 0,
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
        side:
          mat.side === THREE.FrontSide
            ? "front"
            : mat.side === THREE.BackSide
            ? "back"
            : "double",
      };

      // Save texture and normal map (Base64)
      objectData.material.texture = await textureToBase64(obj.material.map);
      objectData.material.normalMap = await textureToBase64(
        obj.material.normalMap
      );
    }

    // --- Light-Specific Properties ---
    if (
      obj.type === "pointLight" ||
      obj.type === "spotLight" ||
      obj.type === "directionalLight"
    ) {
      objectData.color = obj.color;
      objectData.intensity = obj.intensity;
      if (obj.type === "spotLight") {
        objectData.angle = obj.angle;
        objectData.penumbra = obj.penumbra;
        objectData.distance = obj.distance;
        objectData.decay = obj.decay;
      }
      if (obj.type === "spotLight" || obj.type === "directionalLight") {
        objectData.target = obj.target;
      }
    }

    // --- Imported Object Handling ---
    if (obj.mesh && obj.mesh.userData && obj.mesh.userData.originalFile) {
      const originalFile = obj.mesh.userData.originalFile;
      objectData.originalFileName = originalFile.name;
      // objectData.fileData = await fileToBase64(originalFile); //removed for consistency
    }
    dataToSave.objects.push(objectData);
  }

  const sessionUsername = localStorage.getItem("username");
  if (!sessionUsername) {
    console.error("Error saving scene: No user logged in.");
    return;
  }
  // Send JSON directly
  try {
    console.log("Saving scene:", dataToSave);
    const response = await axios.post(
      "http://localhost:5050/save",
      {
        objects: dataToSave.objects,
        sceneSettings: dataToSave.sceneSettings,
        sceneName,
        sceneId: dataToSave.sceneId, //send sceneId
      }, // Send the actual data
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response:", response); // Log the entire response

    if (response.status !== 201 && response.status !== 200) { //check for both create and update
      throw new Error(
        `Failed to save scene: ${response.status} - ${response.data}`
      );
    }


    console.log("Scene saved successfully:", response.data);
    if (response.data.sceneId) {
      console.log("Scene ID:", response.data.sceneId);
    }
    return response.data; // IMPORTANT: Return the response data

  } catch (error) {
    console.error("Error saving scene:", error);
    // navigate('/error');
    throw error; // Re-throw the error so the caller can handle it
  }
};

const loadScene = async (sceneId, setSceneObjects, setSceneSettings, type) => {
  try {
    let response
    if(type==1){
      response = await axios.get(
        `http://localhost:5050/get-scene?sceneId=${sceneId}`,
        {
          responseType: "json", // Expect JSON
          withCredentials: true,
        }
      );
    }
    if(type==2){
      response = await axios.get(
        `http://localhost:5050/get-community-example?exampleId=${sceneId}`,
        {
          responseType: "json", // Expect JSON
          withCredentials: true,
        }
      );
    }


    if (response.status !== 200) {
      throw new Error(`Failed to load scene: ${response.status}`);
    }

    const loadedData = response.data;
    console.log("Loaded scene data:", loadedData);

    if (
      !loadedData.objects ||
      typeof loadedData.objects[Symbol.iterator] !== "function"
    ) {
      // --- saveAndLoad.js --- (continued)
      console.error("Error loading .artxthree file: Invalid objects data.");
      return;
    }
    if (!loadedData.sceneSettings) {
      console.error(
        "Error loading .artxthree file: Invalid sceneSettings data."
      );
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
          side:
            mat.side === "front"
              ? THREE.FrontSide
              : mat.side === "back"
              ? THREE.BackSide
              : THREE.DoubleSide,
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
      if (
        objData.type === "pointLight" ||
        objData.type === "spotLight" ||
        objData.type === "directionalLight"
      ) {
        newObject.color = objData.color;
        newObject.intensity = objData.intensity;
        if (objData.type === "spotLight") {
          newObject.angle = objData.angle;
          newObject.penumbra = objData.penumbra;
          newObject.distance = objData.distance;
          newObject.decay = objData.decay;
        }
        if (
          objData.type === "spotLight" ||
          objData.type === "directionalLight"
        ) {
          newObject.target = objData.target;
        }
      }
      // --- Imported Object Loading ---: remove async for now
      if (objData.originalFileName) {
        const fileName = objData.originalFileName;
        const loader = getLoader(fileName);
        if (!loader) {
          console.error("Unsupported file type for", fileName);
          continue; // Skip to the next object
        }

        newObject.mesh = { userData: {} }; //create a mesh
      }
      newSceneObjects.push(newObject); //push outside async
    }
    setSceneObjects(newSceneObjects);
    setSceneSettings({ ...loadedData.sceneSettings });
  } catch (error) {
    console.error("Error loading scene:", error);
    // navigate('/error');
  }
};

const getMimeType = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  switch (ext) {
    case "gltf":
    case "glb":
      return "model/gltf+json";
    case "obj":
      return "text/plain";
    case "fbx":
      return "application/octet-stream";
    case "stl":
      return "application/sla";
    default:
      return "application/octet-stream";
  }
};

const getLoader = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  if (ext === "gltf" || ext === "glb") {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    loader.setDRACOLoader(dracoLoader);
    return loader;
  } else if (ext === "obj") {
    return new OBJLoader();
  } else if (ext === "fbx") {
    return new FBXLoader();
  } else if (ext === "stl") {
    return new STLLoader();
  }
  return null;
};

// No longer needed since we are not loading files, only scene data
// function dataURLtoFile(dataurl, filename) { ... }

export { saveScene, loadScene };