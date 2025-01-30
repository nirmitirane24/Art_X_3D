import React, { useState } from "react";

const UndoRedo = ({ sceneObjects, setSceneObjects, sceneSettings, setSceneSettings, selectedObjects, setSelectedObjects }) => {
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    const saveToUndoStack = (newSceneObjects, newSceneSettings) => {
        setUndoStack(prevStack => [
            ...prevStack,
            { sceneObjects: newSceneObjects, sceneSettings: newSceneSettings }
        ]);
        setRedoStack([]);
    };

    const undo = () => {
        if (undoStack.length > 0) {
            const previousState = undoStack[undoStack.length - 1];

            setRedoStack((prevStack) => [
                ...prevStack,
                { sceneObjects, sceneSettings },
            ]);

            setSceneObjects(previousState.sceneObjects ?? []);
            setSceneSettings(previousState.sceneSettings ?? {});

            setSelectedObjects((prevSelected) =>
                previousState.sceneObjects?.length > 0
                    ? prevSelected.filter(id => previousState.sceneObjects.some(obj => obj.id === id))
                    : []
            );

            setUndoStack((prevStack) => prevStack.slice(0, -1));
        }
    };

    const redo = () => {
        if (redoStack.length > 0) {
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