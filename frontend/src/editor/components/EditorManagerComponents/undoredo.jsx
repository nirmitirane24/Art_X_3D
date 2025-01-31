import React, { useState } from "react";

const UndoRedo = ({ sceneObjects, setSceneObjects, sceneSettings, setSceneSettings, selectedObjects, setSelectedObjects }) => {
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    const saveToUndoStack = (newSceneObjects, newSceneSettings) => {
        if (!newSceneObjects || !newSceneSettings) {
            console.warn("Skipping invalid state save to undo stack.");
            return;
        }
    
        // Ensure at least one object exists in scene before saving
        if (newSceneObjects.length === 0 && undoStack.length > 0) {
            console.warn("Skipping empty scene save to undo stack.");
            return;
        }
    
        setUndoStack((prevStack) => [
            ...prevStack,
            { 
                sceneObjects: [...newSceneObjects], 
                sceneSettings: { ...newSceneSettings }
            }
        ]);
        setRedoStack([]); // Clear redo stack on new action
    };
    

    const undo = () => {
        try {
            if (undoStack?.length > 0) {
                const previousState = undoStack[undoStack.length - 1];
    
                // If previous state is invalid, restore the most recent valid one
                if (!previousState.sceneObjects || !previousState.sceneSettings) {
                    console.warn("Undo: Previous state is invalid, restoring last valid state.");
                    return;
                }
    
                setRedoStack((prevStack) => [
                    ...prevStack,
                    { sceneObjects, sceneSettings },
                ]);
    
                console.log("Restoring Background Color:", previousState.sceneSettings.backgroundColor);
    
                setSceneObjects([...previousState.sceneObjects]);
                setSceneSettings({ ...previousState.sceneSettings });
    
                setSelectedObjects(prevSelected =>
                    previousState.sceneObjects.length > 0
                        ? prevSelected.filter(id => previousState.sceneObjects.some(obj => obj.id === id))
                        : []
                );
    
                setUndoStack((prevStack) => prevStack.slice(0, -1));
            }
        } catch (error) {
            console.error("Undo error:", error);
        }
    };
    
    
    const redo = () => {
        if (redoStack?.length > 0) {  // ✅ Prevent undefined errors
            const nextState = redoStack[redoStack.length - 1];
    
            setUndoStack((prevStack) => [
                ...prevStack,
                { sceneObjects, sceneSettings },
            ]);
    
            setSceneObjects(nextState.sceneObjects ?? []);
            setSceneSettings(nextState.sceneSettings ?? {});
    
            setRedoStack((prevStack) => prevStack.slice(0, -1));
        }
    };

    return { undo, redo, saveToUndoStack, undoStack, redoStack };
};

export default UndoRedo;