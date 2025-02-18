// --- EditorManagerComponents/undoredo.jsx ---
import React, { useState, useCallback } from "react"; // Import useCallback

const UndoRedo = ({
  sceneObjects,
  setSceneObjects,
  sceneSettings,
  setSceneSettings,
  selectedObjects,
  setSelectedObjects,
}) => {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Use useCallback for saveToUndoStack
  const saveToUndoStack = useCallback((newSceneObjects, newSceneSettings) => {
    if (!newSceneObjects || !newSceneSettings) {
      console.warn("Skipping invalid state save to undo stack.");
      return;
    }
    // No need to check for empty scene here.  Let the user undo to an empty scene.

    setUndoStack((prevStack) => [
      ...prevStack,
      {
        sceneObjects: [...newSceneObjects],
        sceneSettings: { ...newSceneSettings },
      },
    ]);
    setRedoStack([]); // Clear redo stack on new action
  }, []); // Empty dependency array because all dependencies are passed as arguments

  const undo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];

      // No need for these checks.  It's OK to restore an empty scene.
      // if (!previousState.sceneObjects || !previousState.sceneSettings) {
      //     console.warn("Undo: Previous state is invalid, restoring last valid state.");
      //     return;
      // }

      // Use functional updates for state updates
      setRedoStack((prevStack) => [
        ...prevStack,
        {
          sceneObjects: [...sceneObjects],
          sceneSettings: { ...sceneSettings },
        }, // Deep copy current state
      ]);

      // Use functional updates, and spread the previous state to avoid mutation
      setSceneObjects([...previousState.sceneObjects]);
      setSceneSettings({ ...previousState.sceneSettings });

      // Clear selection after undo.  This is generally better UX.
      setSelectedObjects([]);

      setUndoStack((prevStack) => prevStack.slice(0, -1));
    }
  }, [
    undoStack,
    sceneObjects,
    sceneSettings,
    setSceneObjects,
    setSceneSettings,
    setSelectedObjects,
  ]); // Add dependencies

  const redo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];

      // Use functional updates for state updates.  Deep copy current state.
      setUndoStack((prevStack) => [
        ...prevStack,
        {
          sceneObjects: [...sceneObjects],
          sceneSettings: { ...sceneSettings },
        },
      ]);

      // Use functional updates, and spread the next state to avoid mutation
      setSceneObjects([...nextState.sceneObjects]);
      setSceneSettings({ ...nextState.sceneSettings });

      // Clear selection after redo.
      setSelectedObjects([]);

      setRedoStack((prevStack) => prevStack.slice(0, -1));
    }
  }, [
    redoStack,
    sceneObjects,
    sceneSettings,
    setSceneObjects,
    setSceneSettings,
    setSelectedObjects,
  ]); // Add dependencies

  return { undo, redo, saveToUndoStack, undoStack, redoStack };
};

export default UndoRedo;
