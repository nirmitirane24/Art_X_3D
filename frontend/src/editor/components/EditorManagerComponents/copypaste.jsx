import { useState } from "react";

const CopyPaste = ({ sceneObjects, selectedObjects, setSceneObjects, saveToUndoStack }) => {
    const [copiedObjects, setCopiedObjects] = useState([]);

    const copySelectedObjects = () => {
        const copied = sceneObjects
            .filter((obj) => selectedObjects.includes(obj.id))
            .map(obj => ({
                ...obj,
                // Deep clone the mesh if it exists
                mesh: obj.mesh ? obj.mesh.clone() : null
            }));
        setCopiedObjects(copied);
    };

    const pasteCopiedObjects = () => {
        if (copiedObjects.length > 0) {
            saveToUndoStack(sceneObjects);

            const newObjects = copiedObjects.map((obj) => {
                const newObject = { 
                    ...obj,
                    id: Date.now(),
                    position: [
                        obj.position[0] + 1,
                        obj.position[1] + 1,
                        obj.position[2] + 1
                    ],
                    // Clone the mesh again for the new instance
                    mesh: obj.mesh ? obj.mesh.clone() : null
                };
                return newObject;
            });

            setSceneObjects([...sceneObjects, ...newObjects]);
        }
    };

    return { copySelectedObjects, pasteCopiedObjects };
};

export default CopyPaste;