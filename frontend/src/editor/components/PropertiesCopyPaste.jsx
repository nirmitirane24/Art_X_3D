import React, { useState, useEffect } from "react";

const PropertiesCopyPaste = ({
  sceneObjects,
  selectedObjects,
  setSceneObjects,
  saveToUndoStack,
}) => {
  const [copiedProperties, setCopiedProperties] = useState(null);

  const copyProperties = () => {
    if (selectedObjects.length === 1) {
      const sourceObject = sceneObjects.find(
        (obj) => obj.id === selectedObjects[0]
      );
      if (sourceObject) {
        // Copy relevant properties (you can customize this)
        const { position, rotation, scale, material } = sourceObject;
        setCopiedProperties({ position, rotation, scale, material });
        console.log("Properties copied from object:", sourceObject.id);
      }
    } else {
      console.warn("Select exactly one object to copy properties from.");
    }
  };

  const pasteProperties = () => {
    if (selectedObjects.length > 0 && copiedProperties) {
      saveToUndoStack([...sceneObjects], {}); // Save current scene state

      const updatedSceneObjects = sceneObjects.map((obj) => {
        if (selectedObjects.includes(obj.id)) {
          // Apply copied properties to selected object
          return {
            ...obj,
            position: [...copiedProperties.position],
            rotation: [...copiedProperties.rotation],
            scale: [...copiedProperties.scale],
            material: { ...copiedProperties.material },
          };
        }
        return obj;
      });

      setSceneObjects(updatedSceneObjects);
    } else {
      if (selectedObjects.length === 0) {
        console.warn("Select one or more objects to paste properties to.");
      } else if (!copiedProperties) {
        console.warn("No properties have been copied yet.");
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey) {
        if (event.key === "a") {
          event.preventDefault(); // Prevent browser default behavior
          copyProperties();
        } else if (event.key === "q") {
          event.preventDefault(); // Prevent browser default behavior
          pasteProperties();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sceneObjects, selectedObjects, copiedProperties, saveToUndoStack]);

  return null; // This component doesn't render anything
};

export default PropertiesCopyPaste;
