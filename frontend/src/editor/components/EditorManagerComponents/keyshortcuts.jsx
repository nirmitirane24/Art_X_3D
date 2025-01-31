import React, { useState, useEffect, useRef } from "react";
const KeyboardShortcuts = ({
  selectedObjects,
  deleteSelectedObjects,
  undo,
  redo,
  copySelectedObjects,
  pasteCopiedObjects,
  handleArrowKeyMovement,
  duplicateObject,
  rotateObject,
  scaleObject,
}) => {
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const contextMenuRef = useRef(null); // Reference for the context menu
  const handleContextMenu = (event) => {
    event.preventDefault(); // Disable default context menu
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true); // Show the custom context menu
  };
  const handleCloseContextMenu = () => {
    setShowContextMenu(false);
  };
  const handleContextMenuOption = (action) => {
    if (action === "copy") {
      copySelectedObjects();
    } else if (action === "paste") {
      pasteCopiedObjects();
    } else if (action === "duplicate") {
      duplicateObject();
    } else if (action === "rotate") {
      rotateObject();
    } else if (action === "scale") {
      scaleObject();
    }
    setShowContextMenu(false); // Close context menu after selecting an option
  };
  // Close context menu if the user clicks outside of the context menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Delete" && selectedObjects.length > 0) {
        deleteSelectedObjects();
      } else if (event.ctrlKey && event.key === "z") {
        undo();
      } else if (event.ctrlKey && event.key === "y") {
        redo();
      } else if (event.ctrlKey && event.key === "c") {
        copySelectedObjects();
      } else if (event.ctrlKey && event.key === "v") {
        pasteCopiedObjects();
      } else if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {
        handleArrowKeyMovement(event);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [selectedObjects, deleteSelectedObjects, undo, redo, copySelectedObjects, pasteCopiedObjects, handleArrowKeyMovement]);
  return (
    <>
      {showContextMenu && (
        <div
          ref={contextMenuRef} // Attach the ref to the context menu
          style={{
            position: "absolute",
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            backgroundColor: "black",
            border: "none",
            borderRadius: "5px",
            padding: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
          }}
        >
          <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
            <li
              style={{ padding: "5px", cursor: "pointer" }}
              onClick={() => handleContextMenuOption("copy")}
            >
              Copy
            </li>
            <li
              style={{ padding: "5px", cursor: "pointer" }}
              onClick={() => handleContextMenuOption("paste")}
            >
              Paste
            </li>
            <li
              style={{ padding: "5px", cursor: "pointer" }}
              onClick={() => handleContextMenuOption("duplicate")}
            >
              Duplicate
            </li>
            <li
              style={{ padding: "5px", cursor: "pointer" }}
              onClick={() => handleContextMenuOption("rotate")}
            >
              Rotate
            </li>
            <li
              style={{ padding: "5px", cursor: "pointer" }}
              onClick={() => handleContextMenuOption("scale")}
            >
              Scale
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;