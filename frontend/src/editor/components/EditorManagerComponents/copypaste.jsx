import { useState } from "react";
const CopyPaste = ({ sceneObjects, selectedObjects, setSceneObjects, saveToUndoStack }) => {
    const [copiedObjects, setCopiedObjects] = useState([]);
    const [undoStack, setUndoStack] = useState([]); 
    const [redoStack, setRedoStack] = useState([]);
    const copySelectedObjects = () => {
        const copied = sceneObjects.filter((obj) => selectedObjects.includes(obj.id));
        setCopiedObjects(copied);
    };
    const pasteCopiedObjects = () => {
        if (copiedObjects.length > 0) {
            saveToUndoStack([...sceneObjects]); // Save state before pasting
            const newObjects = copiedObjects.map((obj) => {
                const newObject = { ...obj, id: Date.now(), position: [...obj.position] };
                // Offset pasted objects to avoid overlap
                newObject.position[0] += 1;
                newObject.position[1] += 1;
                newObject.position[2] += 1;
                return newObject;
            });
            const updatedScene = [...sceneObjects, ...newObjects];
            // Save state after paste for redo
            setUndoStack((prevStack) => [...prevStack, sceneObjects]);
            setRedoStack([]); // Clear redo on new action
            setSceneObjects(updatedScene);
        }
    };
    const undoPaste = () => {
        if (undoStack.length > 0) {
            const prevSceneObjects = undoStack[undoStack.length - 1];
            
            setRedoStack((prevStack) => [...prevStack, sceneObjects]); // Save current state to redo stack
            setUndoStack((prevStack) => prevStack.slice(0, -1)); // Remove last state from undo stack
            
            setSceneObjects(prevSceneObjects); // Restore the last scene
        }
    };
    const redoPaste = () => {
        if (redoStack.length > 0) {
            const nextSceneObjects = redoStack[redoStack.length - 1];
            
            setUndoStack((prevStack) => [...prevStack, sceneObjects]); // Save current state to undo stack
            setRedoStack((prevStack) => prevStack.slice(0, -1)); // Remove last state from redo stack
            
            setSceneObjects(nextSceneObjects); // Restore the next scene
        }
    };
    return { copySelectedObjects, pasteCopiedObjects, undoPaste, redoPaste };
};
export default CopyPaste;