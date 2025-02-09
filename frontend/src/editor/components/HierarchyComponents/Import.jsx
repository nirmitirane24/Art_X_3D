import React, { useState, useEffect, useRef } from "react";
import { FaFileImport, FaTimes } from "react-icons/fa";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as THREE from "three";

const Import = ({ onImportScene }) => {
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateUniqueId = () => {
    return `model-${Math.random().toString(36).substr(2, 9)}`;
  };

  const applyScalingAndImport = (loadedScene, metadata) => {
    const sceneGroup = loadedScene.scene || loadedScene;
    const boundingBox = new THREE.Box3().setFromObject(sceneGroup);
    const size = boundingBox.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const scaleFactor = maxSize > 5 ? 5 / maxSize : 1;

    sceneGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

    onImportScene({ ...loadedScene, metadata });
    setIsLoading(false);
    setShowImportPanel(false);
  };

  const handleGLTFImport = (data, extension, fileName) => {
    setIsLoading(true);
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    loader.setDRACOLoader(dracoLoader);

    loader.parse(
      data,
      "",
      (loadedScene) => {
        console.log("Loaded GLTF Scene:", loadedScene);
        const metadata = {
          id: generateUniqueId(),
          name: fileName,
          type: "gltf",
          materials: [],
          textures: [],
        };

        // Extract textures and materials
        loadedScene.scene.traverse((child) => {
          if (child.isMesh) {
            if (child.material) {
              metadata.materials.push(child.material);
            }
            if (child.material.map) {
              metadata.textures.push(child.material.map);
            }
          }
        });

        // Pass the loaded scene and metadata to the parent component
        applyScalingAndImport(loadedScene, metadata);
      },
      (error) => {
        console.error("Error loading GLTF file:", error);
        setIsLoading(false);
      }
    );
    dracoLoader.dispose();
  };

  const handleFBXImport = (data, fileName) => {
    setIsLoading(true);
    const loader = new FBXLoader();
    loader.parse(
      data,
      "",
      (loadedScene) => {
        console.log("Loaded FBX Scene:", loadedScene);
        const metadata = {
          id: generateUniqueId(),
          name: fileName,
          type: "fbx",
          materials: [],
          textures: [],
        };
        loadedScene.traverse((child) => {
          if (child.isMesh) {
            if (child.material) {
              metadata.materials.push(child.material);
            }
            if (child.material.map) {
              metadata.textures.push(child.material.map);
            }
          }
        });
        applyScalingAndImport({ scene: loadedScene }, metadata);
      },
      (error) => {
        console.error("Error loading FBX file:", error);
        setIsLoading(false);
      }
    );
  };

  const handleOBJImport = (data, fileName) => {
    setIsLoading(true);
    const loader = new OBJLoader();
    try {
      const object = loader.parse(data);
      console.log("Loaded OBJ Scene:", object);
      const metadata = {
        id: generateUniqueId(),
        name: fileName,
        type: "obj",
        materials: [],
        textures: [],
      };
      object.traverse((child) => {
        if (child.isMesh) {
          if (child.material) {
            metadata.materials.push(child.material);
          }
          if (child.material.map) {
            metadata.textures.push(child.material.map);
          }
        }
      });
      applyScalingAndImport({ scene: object }, metadata);
    } catch (error) {
      console.error("Error loading OBJ file:", error);
      setIsLoading(false);
    }
  };

  const handleSTLImport = (data, fileName) => {
    setIsLoading(true);
    const loader = new STLLoader();
    try {
      const geometry = loader.parse(data);
      const material = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.5,
        roughness: 0.5,
      });
      const mesh = new THREE.Mesh(geometry, material);
      console.log("Loaded STL Scene:", mesh);
      const metadata = {
        id: generateUniqueId(),
        name: fileName,
        type: "stl",
        materials: [material],
        textures: [],
      };
      applyScalingAndImport({ scene: mesh }, metadata);
    } catch (error) {
      console.error("Error loading STL file:", error);
      setIsLoading(false);
    }
  };

  const handleFileSelection = (acceptedFormats) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = acceptedFormats;
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const extension = file.name.split(".").pop().toLowerCase();
        const fileName = file.name.split(".")[0];
        const reader = new FileReader();

        reader.onload = (event) => {
          const data = event.target.result;

          switch (extension) {
            case "gltf":
            case "glb":
              handleGLTFImport(data, extension, fileName);
              break;
            case "obj":
              handleOBJImport(data, fileName);
              break;
            case "fbx":
              handleFBXImport(data, fileName);
              break;
            case "stl":
              handleSTLImport(data, fileName);
              break;
            default:
              console.error("Unsupported file format:", extension);
              setIsLoading(false);
          }
        };

        setIsLoading(true);
        if (["gltf", "glb", "fbx", "stl"].includes(extension)) {
          reader.readAsArrayBuffer(file);
        } else if (extension === "obj") {
          reader.readAsText(file);
        } else {
          console.error("Unsupported file format:", extension);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    input.click();
  };

  const panelRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowImportPanel(false);
      }
    };

    if (showImportPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showImportPanel]);

  const handleClosePanel = () => {
    setShowImportPanel(false);
  };

  return (
    <div>
      <button onClick={() => setShowImportPanel(true)} disabled={isLoading}>
        <FaFileImport /> <span>Import</span>
      </button>

      {showImportPanel && (
        <div
          className="import-panel"
          ref={panelRef}
        >
          <FaTimes
            onClick={handleClosePanel}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              cursor: "pointer",
              fontSize: "20px",
            }}
          />
          <h3>Import 3D Model</h3>
          {isLoading ? (
            <div className="loading-indicator">
              <div className="loading-text">LOADING...</div>
              <div className="loading-bar-container">
                <div className="loading-bar-fill" style={{ width: "50%" }}></div>
              </div>
            </div>
          ) : (
            <div className="import-options">
              <button
                className="modal-buttons"
                onClick={() => handleFileSelection(".gltf,.glb,.obj,.fbx,.stl")}
                disabled={isLoading}
              >
                3D Model (GLTF, OBJ, FBX, STL)
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Import;