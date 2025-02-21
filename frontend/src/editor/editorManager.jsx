// --- editorManager.jsx --- (Revised)

import React, { useState, useRef, useEffect, useContext } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import Toolbar from "./components/Toolbar";
import HierarchyPanel from "./components/HierarchyPanel.jsx";
import PropertiesPanel from "./components/PropertiesPanel";
import CameraControls, { SceneContext } from "./components/CameraControls";
import GroundPlane from "./components/GroundPlane";
import Model from "./components/Model";
import AIChat from "./components/AIChat";
import PropertiesCopyPaste from "./components/PropertiesCopyPaste";
import "./styles/editorManager.css";
import * as THREE from "three";
import UndoRedo from "./components/EditorManagerComponents/undoredo.jsx";
import KeyboardShortcuts from "./components/EditorManagerComponents/keyshortcuts.jsx";
import CopyPaste from "./components/EditorManagerComponents/copypaste.jsx";
import LightComponent from "./components/Light/LightComponent.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingPage from "../pages/loading.jsx";
import { loadScene, saveScene } from "./components/saveAndLoad"; // Import saveScene

const EditorManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [currentSceneId, setCurrentSceneId] = useState(null);
  const [currentSceneName, setCurrentSceneName] = useState("");
  const canvasRef = useRef();

  useEffect(() => {
    const checkAuth = async () => {
      try{
        // Use the /auth/check endpoint, as it was designed for this.
        const response = await axios.get("http://localhost:5050/auth/check", {
          withCredentials: true,
        });
        // Get the username from the *response* of /auth/check.
        console.log("User authenticated:", response.data);
        if(response.data.username === undefined || response.data.username === null){
          navigate("/");
        }
        setUsername(response.data.username);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/");
        } else {
          console.error("Error checking authentication:", error);
          // Optionally show an error message to the user
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const [sceneObjects, setSceneObjects] = useState([]);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [sceneSettings, setSceneSettings] = useState({
    backgroundColor: "#2D2E32",
    effectsEnabled: false,
    fogEnabled: false,
    fogColor: "#ffffff",
    fogNear: 1,
    fogFar: 100,
    ambientShadowsEnabled: false,
    ambientIntensity: 0,
    lightColor: "#ffffff",
    lightIntensity: 5,
    lightX: 0,
    lightY: 0,
    lightZ: 0,
    lightShadows: false,
    shadowMapSize: 1024,
    shadowCameraNear: 0.1,
    shadowCameraFar: 50,
    shadowCameraLeft: -10,
    shadowCameraRight: 10,
    shadowCameraTop: 10,
    shadowCameraBottom: -10,
  });
  const sceneRef = useRef(new THREE.Scene());
  const dirLightRef = useRef(); // Ref for the directional light

  // Use the returned saveToUndoStack from UndoRedo
  const { undo, redo, saveToUndoStack, undoStack, redoStack } = UndoRedo({
    sceneObjects,
    setSceneObjects,
    sceneSettings,
    setSceneSettings,
    selectedObjects,
    setSelectedObjects,
  });

  const { copySelectedObjects, pasteCopiedObjects, undoPaste, redoPaste } =
    CopyPaste({
      sceneObjects,
      selectedObjects,
      setSceneObjects,
      saveToUndoStack, // Pass it here
    });

  const deleteSelectedObjects = () => {
    if (selectedObjects.length > 0) {
      // Use the most current state
      saveToUndoStack(sceneObjects, sceneSettings);

      setSceneObjects((prevObjects) =>
        prevObjects.filter((obj) => {
          if (selectedObjects.includes(obj.id)) {
            const object3D = sceneRef.current.getObjectById(obj.id);
            if (object3D) {
              object3D.traverse((child) => {
                if (child.isMesh) {
                  if (child.geometry) child.geometry.dispose();
                  if (child.material) child.material.dispose();
                }
              });
              sceneRef.current.remove(object3D);
            }
            return false;
          }
          return true;
        })
      );

      setSelectedObjects([]);
      setCameraEnabled(true); // Re-enable camera after delete
    }
  };

  const handleDeleteObject = (objectId) => {
    // Use functional updates for state updates
    saveToUndoStack(sceneObjects, sceneSettings);
    setSceneObjects((prevObjects) =>
      prevObjects.filter((obj) => obj.id !== objectId)
    );
    setSelectedObjects((prevSelected) =>
      prevSelected.filter((id) => id !== objectId)
    );
    setCameraEnabled(true); // Re-enable the camera.
  };

  const handleArrowKeyMovement = (event) => {
    if (selectedObjects.length > 0) {
      const step = 0.5;
      const movement = { x: 0, y: 0, z: 0 };
      if (event.key === "ArrowUp") movement.y = step;
      if (event.key === "ArrowDown") movement.y = -step;
      if (event.key === "ArrowLeft") movement.x = -step;
      if (event.key === "ArrowRight") movement.x = step;
      saveToUndoStack(sceneObjects, sceneSettings); // Use current state
      setSceneObjects((prevObjects) => {
        const updatedObjects = prevObjects.map((obj) => {
          if (selectedObjects.includes(obj.id)) {
            return {
              ...obj,
              position: [
                obj.position[0] + movement.x,
                obj.position[1] + movement.y,
                obj.position[2] + movement.z,
              ],
            };
          }
          return obj;
        });
        return updatedObjects;
      });
    }
  };

  const addModel = (type) => {
    // First, save the current state to the undo stack.  BEFORE changing the scene.
    saveToUndoStack(sceneObjects, sceneSettings);

    //setCurrentSceneId(null); //Dont set sceneId null
    //setCurrentSceneName(""); //dont null the name
    const newObject = {
      id: Date.now(),
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        color: "#ffffff",
        metalness: 0,
        roughness: 0.5,
        castShadow: false,
        receiveShadow: false,
      },
      children: [],
    };

    // Use functional update for setSceneObjects
    setSceneObjects((prevObjects) => [...prevObjects, newObject]);
  };

  const addLight = (type) => {
    // First, save the current state to the undo stack. BEFORE changing the scene.
    saveToUndoStack(sceneObjects, sceneSettings);

   // setCurrentSceneId(null);
    //setCurrentSceneName("");
    const lightId = Math.floor(10000 + Math.random() * 90000);
    const lightProps = {
      id: lightId,
      type,
      displayId: `${type} ${lightId}`,
      position: [1, 3, 2],
      color: "#ffffff",
      intensity: 1,
    };

    if (type === "spotLight") {
      lightProps.angle = Math.PI / 6;
      lightProps.penumbra = 0.1;
      lightProps.distance = 0;
      lightProps.decay = 2;
      lightProps.target = [0, 0, 0];
    } else if (type === "directionalLight") {
      lightProps.target = [0, 0, 0];
    }

    // Use functional update for setSceneObjects
    setSceneObjects((prevObjects) => [...prevObjects, lightProps]);
  };

  const handleObjectSelect = (objectIds) => {
    if (!objectIds || objectIds.length === 0) return;
    setSelectedObjects(objectIds);
    setCameraEnabled(false);
  };

  const updateObject = (objectId, newProps) => {
    if (objectId === "scene") {
      // Save to undo stack before updating
      saveToUndoStack(sceneObjects, sceneSettings);
      setSceneSettings((prevSettings) => ({
        ...prevSettings,
        ...newProps,
      }));
    } else {
      // Save to undo stack before updating
      saveToUndoStack(sceneObjects, sceneSettings);
      setSceneObjects((prevObjects) =>
        prevObjects.map((obj) =>
          obj.id === objectId ? { ...obj, ...newProps } : obj
        )
      );
    }
  };

  const deselectAllObjects = (event) => {
    let isTransformControlsInteraction = false;
    if (selectedObjects.length > 0) {
      const sceneObject = sceneRef.current.getObjectById(selectedObjects[0]);
      if (sceneObject) {
        sceneObject.traverse((child) => {
          if (
            child.isTransformControls &&
            child.domElement.contains(event.target)
          ) {
            isTransformControlsInteraction = true;
          }
        });
      }
    }

    if (
      !isTransformControlsInteraction &&
      event.target.closest(".edit-mode-button")
    ) {
      setSelectedObjects([]);
      setCameraEnabled(true);
    }
  };

  const handleSceneNameChange = (newName) => {
    localStorage.setItem("currentSceneName", newName);
    setCurrentSceneName(newName);
  };
// --- Inside EditorManager component
    const handleSave = async () => {
      const canvas = document.getElementById("r3f-canvas");
      if(!canvas){
        console.error("Canvas element not found");
        return;
      }
      
      canvas.toBlob(async (blob) => {
        if(!blob){
          console.error("Failed to create blob from canvas");
          return;
        }
        try {
          const response = await saveScene(
            sceneObjects,
            sceneSettings,
            currentSceneName,
            currentSceneId,
            blob
          );
          if (response && response.sceneId) {
            setCurrentSceneId(response.sceneId);
            localStorage.setItem("currentSceneId", response.sceneId);
          }
        } catch(error) {
            console.error("Save failed:", error);
        }
      }, "image/jpeg");
};



  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sceneId = urlParams.get('sceneId');
    const exampleId = urlParams.get('exampleId');

    if (sceneId) {
      // Load user's scene
      loadScene(sceneId, setSceneObjects, setSceneSettings,1);
      setCurrentSceneId(sceneId);
      localStorage.setItem('currentSceneId', sceneId);
      setLoading(true);
      axios.get(`http://localhost:5050/get-scene-url?sceneId=${sceneId}`, { withCredentials: true })
          .then(response => {
              if (response.status === 200) {
                  setCurrentSceneName(response.data.sceneName);
                  localStorage.setItem('currentSceneName', response.data.sceneName);
                  setLoading(false);
              }
          })
          .catch(error => console.error("Error getting scene name", error));

  } else if (exampleId) {
      // Load community example
      setLoading(true);
      loadScene(exampleId, setSceneObjects, setSceneSettings, 2);
  } else {
      setLoading(false);
  }
}, []);

  const getSceneContext = () => {
    const { gl, scene, camera } = useThree(); // Correct: Use useThree inside a component
    return { gl, scene, camera };
  }


if (loading) {
  return <LoadingPage />;
}

return (
  <div className="editor-container" onClick={deselectAllObjects}>
    <Toolbar
      onAddModel={addModel}
      onAddLight={addLight}
      onUndo={undo}
      onRedo={redo}
      undoDisabled={undoStack.length === 0}
      redoDisabled={redoStack.length === 0}
      selectedObjects={selectedObjects}
      onSave={handleSave} // Pass the save handler
    />
    <div className="main-area">
      <div className="sidebar">
        <HierarchyPanel
          sceneObjects={sceneObjects}
          onObjectSelect={handleObjectSelect}
          selectedObjects={selectedObjects}
          onObjectDelete={handleDeleteObject}
          scene={sceneRef.current}
          setSceneObjects={setSceneObjects}
          setSceneSettings={setSceneSettings}
          sceneSettings={sceneSettings}
          currentSceneName={currentSceneName}
          onSceneNameChange={handleSceneNameChange}
          currentSceneId={currentSceneId}
          setCurrentSceneId={setCurrentSceneId}
          canvasRef={canvasRef}
        />
        <PropertiesPanel
          selectedObjects={selectedObjects ?? []}
          sceneObjects={sceneObjects ?? []}
          updateObject={updateObject}
          sceneSettings={sceneSettings}
        />
      </div>
      <div className="viewport">
        <Canvas
          shadows
          camera={{ position: [0, 5, 10], fov: 45 }}
          style={{ backgroundColor: sceneSettings.backgroundColor }}
          id="r3f-canvas"
          gl={{ preserveDrawingBuffer: true }}
          onCreated={({ gl }) => {
            canvasRef.current = gl.domElement;
          }}
        >
          <SceneContent
            sceneSettings={sceneSettings}
            sceneRef={sceneRef}
            sceneObjects={sceneObjects}
            selectedObjects={selectedObjects}
            updateObject={updateObject}
            handleObjectSelect={handleObjectSelect}
            dirLightRef={dirLightRef}
          />
          <CameraControls enabled={cameraEnabled} />
        </Canvas>
      </div>
    </div>
    <KeyboardShortcuts
      selectedObjects={selectedObjects}
      deleteSelectedObjects={deleteSelectedObjects}
      undo={() => {
        undo();
        undoPaste();
      }}
      redo={() => {
        redo();
        redoPaste();
      }}
      copySelectedObjects={copySelectedObjects}
      pasteCopiedObjects={pasteCopiedObjects}
      handleArrowKeyMovement={handleArrowKeyMovement}
    />

    <AIChat />
    <PropertiesCopyPaste
      sceneObjects={sceneObjects}
      selectedObjects={selectedObjects}
      setSceneObjects={setSceneObjects}
      saveToUndoStack={saveToUndoStack}
    />
  </div>
);
};

function SceneContent({
sceneSettings,
sceneRef,
sceneObjects,
selectedObjects,
updateObject,
handleObjectSelect,
dirLightRef,
}) {
const { gl } = useThree();

useEffect(() => {
  if (gl && sceneSettings.backgroundColor) {
    gl.setClearColor(sceneSettings.backgroundColor);
  }
  if (dirLightRef.current) {
    dirLightRef.current.shadow.mapSize.width = sceneSettings.shadowMapSize;
    dirLightRef.current.shadow.mapSize.height = sceneSettings.shadowMapSize;
    dirLightRef.current.shadow.camera.near = sceneSettings.shadowCameraNear;
    dirLightRef.current.shadow.camera.far = sceneSettings.shadowCameraFar;
    dirLightRef.current.shadow.camera.left = sceneSettings.shadowCameraLeft;
    dirLightRef.current.shadow.camera.right = sceneSettings.shadowCameraRight;
    dirLightRef.current.shadow.camera.top = sceneSettings.shadowCameraTop;
    dirLightRef.current.shadow.camera.bottom =
      sceneSettings.shadowCameraBottom;
    dirLightRef.current.shadow.camera.updateProjectionMatrix();
  }
}, [
  sceneSettings.backgroundColor,
  gl,
  sceneSettings.shadowMapSize,
  sceneSettings.shadowCameraNear,
  sceneSettings.shadowCameraFar,
  sceneSettings.shadowCameraLeft,
  sceneSettings.shadowCameraRight,
  sceneSettings.shadowCameraTop,
  sceneSettings.shadowCameraBottom,
  dirLightRef,
]);

return (
  <>
    <ambientLight
      intensity={
        sceneSettings.ambientShadowsEnabled
          ? sceneSettings.ambientIntensity
          : 0
      }
    />
    {sceneSettings.lightShadows ? (
      <pointLight
        ref={dirLightRef}
        position={[
          sceneSettings.lightX,
          sceneSettings.lightY,
          sceneSettings.lightZ,
        ]}
        intensity={sceneSettings.lightIntensity}
        color={sceneSettings.lightColor}
        castShadow
      />
    ) : null}
    {sceneSettings.fogEnabled && (
      <fog
        attach="fog"
        args={[
          sceneSettings.fogColor,
          sceneSettings.fogNear,
          sceneSettings.fogFar,
        ]}
      />
    )}
    <gridHelper args={[10, 10]} />
    <GroundPlane />
    <group ref={sceneRef}>
      {sceneObjects.map((object) => {
        if (
          object.type === "pointLight" ||
          object.type === "spotLight" ||
          object.type === "directionalLight"
        ) {
          return (
            <React.Fragment key={object.id}>
              <LightComponent
                object={object}
                selectedObjects={selectedObjects}
                sceneRef={sceneRef}
              />
            </React.Fragment>
          );
        } else {
          return (
            <Model
              key={object.id}
              object={object}
              isSelected={selectedObjects.includes(object.id)}
              onSelect={() => handleObjectSelect([object.id])}
              onUpdateObject={updateObject}
            />
          );
        }
      })}
    </group>
  </>
);
}

export default EditorManager;